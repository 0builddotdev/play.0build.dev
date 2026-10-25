/** Emits one open tag in the requested spelling. */
import { toDisplayClass, toDisplayShort } from '../shared/display.js';
import { attr, VOID } from './html.js';
import { toShort } from './pairs.js';
import { hasWs, php } from './text.js';
import type { Analysis, OpenTag, Pair, RewriteMode, UEntry } from './types.js';

/** `u="p=4 grid"`, or `:u="[...]"` when a value contains whitespace and needs quoting. */
function renderU(u: UEntry[]): string | null {
	if (!u.length) {
		return null;
	}

	if (u.some((e) => e.value !== null && hasWs(e.value))) {
		const entries = u.map((e) =>
			e.value === null ? `'${php(e.key)}'` : `'${php(e.key)}' => '${php(e.value)}'`
		);
		return attr(':u', `[${entries.join(', ')}]`);
	}
	return attr('u', u.map((e) => (e.value === null ? e.key : `${e.key}=${e.value}`)).join(' '));
}

export function build(
	tag: OpenTag,
	a: Analysis,
	mode: RewriteMode
): { text: string; name: string; drop: boolean } {
	const classTokens: string[] = [];
	const styleDecls: string[] = a.leftover.map((decl) => decl.raw);
	const seenVars = new Set<string>();
	const u: UEntry[] = [];

	const asProper = (pair: Pair) => {
		classTokens.push(pair.cls);
		for (const [name, value] of pair.vars) {
			if (seenVars.has(name)) {
				continue;
			}
			seenVars.add(name);
			styleDecls.push(`${name}: ${value}`);
		}
	};

	for (const item of a.items) {
		if (item.kind === 'static') {
			classTokens.push(item.token);
			continue;
		}

		if (item.kind === 'display') {
			if (mode === 'xui') {
				u.push({ key: toDisplayShort(item.display), value: null });
			} else {
				classTokens.push(toDisplayClass(item.display));
			}
			continue;
		}

		const short = toShort(item.pair);
		if (mode === 'proper' || !short) {
			asProper(item.pair);
		} else if (mode === 'shorthand') {
			if (hasWs(short.value)) {
				asProper(item.pair);
			} else {
				classTokens.push(`${short.key}=${short.value}`);
			}
		} else {
			u.push(short);
		}
	}

	const group: string[] = [];
	if (classTokens.length) {
		group.push(attr('class', classTokens.join(' ')));
	}
	const uAttr = renderU(u);
	if (uAttr) {
		group.push(uAttr);
	}
	if (styleDecls.length) {
		group.push(attr('style', styleDecls.join('; ')));
	}

	// Replace class/style (and u/as on <x-ui>) in place, keeping every other attribute where it was.
	const owned = new Set(['class', 'style']);
	if (a.isXui) {
		owned.add('u');
		owned.add('as');
	}
	const parts: string[] = [];
	if (mode === 'xui' && a.tag !== 'div') {
		parts.push(attr('as', a.tag));
	}
	let placed = false;
	for (const a2 of tag.attrs) {
		if (owned.has(a2.name.toLowerCase())) {
			if (!placed) {
				parts.push(...group);
				placed = true;
			}
			continue;
		}
		parts.push(a2.raw);
	}
	if (!placed) {
		parts.push(...group);
	}

	const name = mode === 'xui' ? 'x-ui' : a.tag;
	const selfOut = mode === 'xui' ? tag.selfClosing || VOID.has(a.tag) : tag.selfClosing;

	// Preserve the original multi-line attribute layout.
	const newline = /\n([ \t]*)/.exec(tag.raw);
	const sep = newline ? `\n${newline[1]}` : ' ';

	const text = `<${name}${parts.length ? sep + parts.join(sep) : ''}${selfOut ? ' />' : '>'}`;
	return { text, name, drop: VOID.has(a.tag) };
}
