import { fail, type Parsed } from './result.js';

/** `50`, `50%`, `0.5`, `[0.5]` → `50%`. */
export function normalizeOpacityToPercent(rawOpacity: string): Parsed<string> {
	const trimmed = rawOpacity.trim();
	const unbracketed =
		trimmed.startsWith('[') && trimmed.endsWith(']') ? trimmed.slice(1, -1).trim() : trimmed;

	const match = unbracketed.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))(%?)$/);
	if (!match) {
		return fail(
			`Invalid opacity modifier "/${rawOpacity}" (expected percentage or decimal like /50, /50%, or /0.5)`
		);
	}

	const [, numStr, pctSign] = match;
	const num = Number(numStr);
	if (Number.isNaN(num)) {
		return fail(`Invalid opacity value "${rawOpacity}"`);
	}

	let pct: number;
	if (pctSign === '%') {
		pct = num;
	} else if (num >= 0 && num <= 1) {
		pct = Number((num * 100).toFixed(4));
	} else {
		pct = num;
	}

	if (pct < 0 || pct > 100) {
		return fail(`Opacity value "${rawOpacity}" must resolve between 0% and 100%`);
	}
	return { ok: true, value: `${pct}%` };
}
