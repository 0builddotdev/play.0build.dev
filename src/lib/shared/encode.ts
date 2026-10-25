/** Thin adapter over the runtime `encoder`, used by both tools. */
import { encoder } from './framework.js';

type EncoderInput = Parameters<typeof encoder>[0];

/** The variant context of a class: everything except the property and value. */
export type ClassContext = Pick<
	EncoderInput,
	'isDark' | 'prefix' | 'pseudoClasses' | 'pseudoElement'
>;

/** Encode `property` (no value, not important) under the given variant context. */
export function encodeProperty(ctx: ClassContext, property: string): string {
	return encoder({
		isDark: ctx.isDark,
		prefix: ctx.prefix,
		property,
		pseudoClasses: ctx.pseudoClasses,
		pseudoElement: ctx.pseudoElement,
		value: null,
		important: false
	});
}
