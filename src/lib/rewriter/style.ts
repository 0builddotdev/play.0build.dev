import type { Decl } from './types.js';

/** Parse a `style` attribute into declarations. Respects quotes, parentheses and Blade `{{ }}`. */
export function parseStyle(style: string): Decl[] {
	const parts: string[] = [];
	let current = '';
	let depth = 0;
	let quote: string | null = null;
	for (let i = 0; i < style.length; i++) {
		const c = style[i]!;
		if (quote) {
			current += c;
			if (c === quote) {
				quote = null;
			}
			continue;
		}
		if (style.startsWith('{{', i)) {
			const end = style.indexOf('}}', i + 2);
			const stop = end === -1 ? style.length : end + 2;
			current += style.slice(i, stop);
			i = stop - 1;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			current += c;
			continue;
		}
		if (c === '(') {
			depth++;
		} else if (c === ')') {
			depth = Math.max(0, depth - 1);
		}
		if (c === ';' && depth === 0) {
			parts.push(current);
			current = '';
			continue;
		}
		current += c;
	}
	parts.push(current);

	return parts
		.map((part) => part.trim())
		.filter(Boolean)
		.map((raw) => {
			const colon = raw.indexOf(':');
			if (colon === -1) {
				return { name: '', value: '', raw };
			}
			return { name: raw.slice(0, colon).trim(), value: raw.slice(colon + 1).trim(), raw };
		});
}
