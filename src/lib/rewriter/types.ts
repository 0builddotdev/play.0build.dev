import type { DisplayToken } from '../shared/display.js';

export type RewriteMode = 'proper' | 'xui' | 'shorthand';

export interface RewriteResult {
	proper: string;
	xui: string;
	shorthand: string;
	/** Number of elements that carried at least one 0build pair or `display-*` token. */
	rewritten: number;
}

export interface Attr {
	name: string;
	value: string | null;
	raw: string;
}

export interface OpenTag {
	name: string;
	attrs: Attr[];
	raw: string;
	end: number;
	selfClosing: boolean;
}

/** One `name: value` declaration from a `style` attribute. */
export interface Decl {
	name: string;
	value: string;
	raw: string;
}

/** Canonical "proper" form of one pair: a class token plus its CSS variables. */
export interface Pair {
	cls: string;
	vars: Array<[string, string]>;
}

/**
 * One token from `class` (or `u` on <x-ui>):
 *  - static  : left exactly as written
 *  - pair    : a class + its `--var`, convertible between proper / shorthand / x-ui
 *  - display : `display-grid` ⇄ `<x-ui u="grid">` (no CSS variable involved)
 */
export type Item =
	| { kind: 'static'; token: string }
	| { kind: 'pair'; pair: Pair }
	| { kind: 'display'; display: DisplayToken };

export interface Analysis {
	/** The real HTML tag (`as` for <x-ui>, `div` by default). */
	tag: string;
	items: Item[];
	leftover: Decl[];
	isXui: boolean;
	hasPairs: boolean;
	hasDisplay: boolean;
}

/** An entry for the x-ui `u` attribute. `value: null` is a bare token such as `grid`. */
export interface UEntry {
	key: string;
	value: string | null;
}

export interface StackEntry {
	src: string;
	/** Name to close with, or null to copy the source closing tag untouched. */
	outName: string | null;
	/** True when the opening tag was emitted self-closed / void, so the closing tag is dropped. */
	drop: boolean;
}
