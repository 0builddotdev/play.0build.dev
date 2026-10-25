/** Result shapes shared by every utility converter. */

export interface CoreTokenSpec {
	base: string;
	value?: string;
}

export interface CoreMatch {
	ok: true;
	base: string;
	value?: string;
	/** Set when one Tailwind utility expands to several 0build tokens. */
	tokens?: CoreTokenSpec[];
}

export interface CoreFail {
	ok: false;
	reason: string;
}

export type CoreResult = CoreMatch | CoreFail;
export type Parsed<T> = { ok: true; value: T } | CoreFail;

export const ok = (base: string, value?: string): CoreMatch =>
	value === undefined ? { ok: true, base } : { ok: true, base, value };

export const fail = (reason: string): CoreFail => ({ ok: false, reason });
