/** Reads one open tag and decides whether (and how) it takes part in a rewrite. */
import { parseDisplayClass, parseDisplayShort } from '../shared/display.js';
import { fromProper, fromShorthand } from './pairs.js';
import { parseStyle } from './style.js';
import { tokenize } from './text.js';
import type { Analysis, Item, OpenTag, RewriteMode } from './types.js';

/** `[color]={red}`-style arbitrary properties stay in `class` untouched. */
const ARBITRARY_PROP_RE = /^(?:[\w-]+:)*\[[^\]]+\](?::[\w-]+)*=\{(?!\{).*\}$/s;

const TAG_NAME_RE = /^[a-z][a-z0-9]*$/;

/**
 * Classify one token.
 * `fromU` picks the display syntax to look for: `display-grid` in `class`, bare `grid` in `u`.
 * A plain `<div class="grid">` is therefore never touched.
 */
function classify(
	token: string,
	vars: Map<string, string>,
	used: Set<string>,
	fromU = false
): Item {
	if (ARBITRARY_PROP_RE.test(token)) {
		return { kind: 'static', token };
	}

	const display = fromU ? parseDisplayShort(token) : parseDisplayClass(token);
	if (display) {
		return { kind: 'display', display };
	}

	const eq = token.indexOf('=');
	if (eq > 0) {
		const value = token.slice(eq + 1);
		if (value) {
			const pair = fromShorthand(token.slice(0, eq), value);
			if (pair) {
				return { kind: 'pair', pair };
			}
		}
		return { kind: 'static', token };
	}

	const pair = fromProper(token, vars);
	if (pair) {
		for (const [name] of pair.vars) {
			used.add(name);
		}
		return { kind: 'pair', pair };
	}
	return { kind: 'static', token };
}

/** Null means "leave this tag exactly as it is". */
export function analyze(tag: OpenTag, mode: RewriteMode): Analysis | null {
	const lower = tag.name.toLowerCase();
	const isXui = lower === 'x-ui';

	if (!isXui && !TAG_NAME_RE.test(tag.name)) {
		return null;
	}
	if (tag.attrs.some((a) => a.name === ':u')) {
		return null;
	}

	const get = (name: string): string | null =>
		tag.attrs.find((a) => a.name.toLowerCase() === name)?.value ?? null;

	let realTag = lower;
	if (isXui) {
		const as = get('as');
		realTag = 'div';
		if (as !== null) {
			if (!/^[a-z][a-z0-9]*$/i.test(as)) {
				return null;
			}
			realTag = as.toLowerCase();
		}
	}

	const decls = parseStyle(get('style') ?? '');
	const vars = new Map<string, string>();
	for (const decl of decls) {
		if (decl.name.startsWith('--')) {
			vars.set(decl.name, decl.value);
		}
	}

	const used = new Set<string>();
	const items: Item[] = [];
	for (const token of tokenize(get('class') ?? '')) {
		items.push(classify(token, vars, used));
	}
	if (isXui) {
		const noVars = new Map<string, string>();
		for (const token of tokenize(get('u') ?? '')) {
			items.push(classify(token, noVars, new Set(), true));
		}
	}

	const hasPairs = items.some((item) => item.kind === 'pair');
	const hasDisplay = items.some((item) => item.kind === 'display');

	// Only the x-ui output treats a lone `display-*` as a reason to rewrite.
	const touched = mode === 'xui' ? hasPairs || hasDisplay : hasPairs || isXui;
	if (!touched) {
		return null;
	}

	return {
		tag: realTag,
		items,
		leftover: decls.filter((decl) => !used.has(decl.name)),
		isXui,
		hasPairs,
		hasDisplay
	};
}
