/** Color vocabulary shared by the converter and the rewriter. */
import { COLORS, INTENSITIES } from './framework.js';

export const COLOR_SET = new Set<string>(COLORS);
export const INTENSITY_SET = new Set<number>(INTENSITIES);

/** Single-word colors accepted by color and `/o` utilities. */
export const NAMED_COLORS = new Set<string>([
	'white',
	'black',
	'transparent',
	'current',
	'inherit'
]);

const SHADED = `(?:${COLORS.join('|')})-(?:${INTENSITIES.join('|')})`;
const SHADED_RE = new RegExp(`^${SHADED}$`);
const SHADED_VAR_RE = new RegExp(`^var\\(--color-(${SHADED})\\)$`);

/** `red-500` → `var(--color-red-500)`; anything else passes through. */
export const resolveColor = (value: string): string =>
	SHADED_RE.test(value) ? `var(--color-${value})` : value;

/** `var(--color-red-500)` → `red-500`; anything else → null. */
export const colorNameFromVar = (value: string): string | null =>
	SHADED_VAR_RE.exec(value)?.[1] ?? null;
