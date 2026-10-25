/** String helpers that understand Blade `{{ … }}` interpolations. */

export const isWs = (c: string | undefined): boolean => c !== undefined && /\s/.test(c);

/** Whitespace outside Blade `{{ }}` interpolations. */
export const hasWs = (value: string): boolean => /\s/.test(value.replace(/\{\{[\s\S]*?\}\}/g, ''));

/** Escape for a single-quoted PHP string. */
export const php = (value: string): string => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/** Split on whitespace, keeping Blade `{{ ... }}` blocks as one token. */
export function tokenize(source: string): string[] {
	const tokens: string[] = [];
	let current = '';
	let i = 0;
	while (i < source.length) {
		if (source.startsWith('{{', i)) {
			const end = source.indexOf('}}', i + 2);
			const stop = end === -1 ? source.length : end + 2;
			current += source.slice(i, stop);
			i = stop;
			continue;
		}
		if (isWs(source[i])) {
			if (current) {
				tokens.push(current);
			}
			current = '';
			i++;
			continue;
		}
		current += source[i];
		i++;
	}
	if (current) {
		tokens.push(current);
	}
	return tokens;
}

/** Index of the last `/` that is not inside `()`, `{}` or `[]`; -1 if none. */
export function lastTopLevelSlash(value: string): number {
	let depth = 0;
	let index = -1;
	for (let i = 0; i < value.length; i++) {
		const c = value[i];
		if (c === '(' || c === '{' || c === '[') {
			depth++;
		} else if (c === ')' || c === '}' || c === ']') {
			depth--;
		} else if (c === '/' && depth === 0) {
			index = i;
		}
	}
	return index;
}
