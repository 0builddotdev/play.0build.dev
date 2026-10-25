/** Variant prefixes (`dark:`, `md:`, `hover:`, `before:`) → one variant context. */
import {
	BREAKPOINTS,
	PSEUDO_CLASSES,
	PSEUDO_ELEMENTS,
	type Breakpoint
} from '../shared/framework.js';
import { has } from '../shared/util.js';
import { fail, type Parsed } from './result.js';

const PSEUDO_CLASS_SET = new Set<string>(
	PSEUDO_CLASSES.map((p) => (p.startsWith(':') ? p.slice(1) : p))
);
const PSEUDO_ELEMENT_SET = new Set<string>(
	PSEUDO_ELEMENTS.map((p) => (p.startsWith('::') ? p.slice(2) : p.startsWith(':') ? p.slice(1) : p))
);

export interface VariantContext {
	isDark: boolean;
	prefix: Breakpoint | null;
	pseudoClasses: string[];
	pseudoElement: string | null;
}

export function parseModifiers(modifiers: string[]): Parsed<VariantContext> {
	let isDark = false;
	let prefix: Breakpoint | null = null;
	const pseudoClasses: string[] = [];
	let pseudoElement: string | null = null;

	for (const mod of modifiers) {
		if (mod === 'dark') {
			isDark = true;
			continue;
		}

		if (mod.startsWith('max-')) {
			return fail(`Breakpoint modifier "${mod}:" is not supported (max-* is not supported)`);
		}

		if (has(BREAKPOINTS, mod)) {
			if (prefix && prefix !== mod) {
				return fail(
					`Multiple breakpoint modifiers ("${String(prefix)}:" and "${mod}:") are not supported`
				);
			}
			prefix = mod as Breakpoint;
			continue;
		}

		if (PSEUDO_CLASS_SET.has(mod)) {
			if (pseudoClasses.length > 0) {
				return fail('Multiple pseudo-class modifiers on a single utility are not supported');
			}
			pseudoClasses.push(mod);
			continue;
		}

		if (PSEUDO_ELEMENT_SET.has(mod)) {
			if (pseudoElement) {
				return fail('Multiple pseudo-element modifiers on a single utility are not supported');
			}
			pseudoElement = mod;
			continue;
		}

		return fail(
			`Modifier "${mod}:" is not supported (only dark, sm–2xl, ${PSEUDO_CLASSES.join(', ')}, and ${PSEUDO_ELEMENTS.join('/')} are supported)`
		);
	}

	return { ok: true, value: { isDark, prefix, pseudoClasses, pseudoElement } };
}
