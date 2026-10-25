/** Minimal HTML scanning: open tags and attribute serialization. */
import { isWs } from './text.js';
import type { Attr, OpenTag } from './types.js';

export const VOID = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'source',
	'track',
	'wbr'
]);
export const RAW_TEXT = new Set(['script', 'style']);

/** Serialize one attribute, picking whichever quote the value does not contain. */
export function attr(name: string, value: string): string {
	if (!value.includes('"')) {
		return `${name}="${value}"`;
	}
	if (!value.includes("'")) {
		return `${name}='${value}'`;
	}
	return `${name}="${value.replace(/"/g, '&quot;')}"`;
}

/** Read the open tag starting at `src[start] === '<'`. Null if it is malformed or unterminated. */
export function readOpenTag(src: string, start: number): OpenTag | null {
	const nameRe = /<([A-Za-z][\w:.-]*)/y;
	nameRe.lastIndex = start;
	const match = nameRe.exec(src);
	if (!match) {
		return null;
	}

	const name = match[1]!;
	let i = start + match[0].length;
	const attrs: Attr[] = [];

	while (i < src.length) {
		while (isWs(src[i])) {
			i++;
		}
		if (i >= src.length) {
			return null;
		}

		if (src[i] === '>') {
			i++;
			return { name, attrs, raw: src.slice(start, i), end: i, selfClosing: false };
		}
		if (src[i] === '/' && src[i + 1] === '>') {
			i += 2;
			return { name, attrs, raw: src.slice(start, i), end: i, selfClosing: true };
		}

		const attrStart = i;
		let attrName: string;
		let value: string | null = null;

		if (src.startsWith('{{', i)) {
			const close = src.indexOf('}}', i + 2);
			if (close === -1) {
				return null;
			}
			i = close + 2;
			attrName = src.slice(attrStart, i);
		} else {
			while (
				i < src.length &&
				!isWs(src[i]) &&
				src[i] !== '=' &&
				src[i] !== '>' &&
				!(src[i] === '/' && src[i + 1] === '>')
			) {
				i++;
			}
			attrName = src.slice(attrStart, i);

			let j = i;
			while (isWs(src[j])) {
				j++;
			}
			if (src[j] === '=') {
				j++;
				while (isWs(src[j])) {
					j++;
				}
				const quote = src[j];
				if (quote === '"' || quote === "'") {
					const close = src.indexOf(quote, j + 1);
					if (close === -1) {
						return null;
					}
					value = src.slice(j + 1, close);
					i = close + 1;
				} else {
					const valueStart = j;
					while (j < src.length && !isWs(src[j]) && src[j] !== '>') {
						j++;
					}
					value = src.slice(valueStart, j);
					i = j;
				}
			}
		}

		if (i === attrStart) {
			i++;
		}
		attrs.push({ name: attrName, value, raw: src.slice(attrStart, i) });
	}
	return null;
}
