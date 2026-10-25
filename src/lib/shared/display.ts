/**
 * `display-*` vocabulary. One list feeds both directions:
 *   converter: Tailwind `grid`            → `display-grid`
 *   rewriter : `display-grid` ⇄ `<x-ui u="grid">`
 */

export const DISPLAY_VALUES = [
	'block',
	'inline-block',
	'inline',
	'flex',
	'inline-flex',
	'table',
	'inline-table',
	'table-caption',
	'table-cell',
	'table-column',
	'table-column-group',
	'table-footer-group',
	'table-header-group',
	'table-row-group',
	'table-row',
	'flow-root',
	'grid',
	'inline-grid',
	'contents',
	'list-item',
	'hidden'
] as const;

/** Bare Tailwind utility → 0build class (`block` → `display-block`). */
export const DISPLAY_MAP: Record<string, string> = Object.fromEntries(
	DISPLAY_VALUES.map((value) => [value, `display-${value}`])
);

const KNOWN = new Set<string>(DISPLAY_VALUES);

/** Variant prefix (`md:`, `dark:hover:`) plus the display value. */
export interface DisplayToken {
	variants: string;
	value: string;
}

const CLASS_RE = /^((?:[\w-]+:)*)display-([a-z][a-z-]*)$/;
const SHORT_RE = /^((?:[\w-]+:)*)([a-z][a-z-]*)$/;

/** `md:display-flex` → `{ variants: 'md:', value: 'flex' }`. Any `display-*` is accepted. */
export function parseDisplayClass(token: string): DisplayToken | null {
	const m = CLASS_RE.exec(token);
	return m ? { variants: m[1]!, value: m[2]! } : null;
}

/** `md:flex` → `{ variants: 'md:', value: 'flex' }`. Only known display values, to avoid false positives. */
export function parseDisplayShort(token: string): DisplayToken | null {
	const m = SHORT_RE.exec(token);
	return m && KNOWN.has(m[2]!) ? { variants: m[1]!, value: m[2]! } : null;
}

export const toDisplayClass = (d: DisplayToken): string => `${d.variants}display-${d.value}`;
export const toDisplayShort = (d: DisplayToken): string => `${d.variants}${d.value}`;
