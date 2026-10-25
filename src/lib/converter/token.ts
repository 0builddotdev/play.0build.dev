/** `dark:md:hover:bg-red-500/50` → `dark:md:bg:hover=red-500/50%`. */
import { encodeProperty, type ClassContext } from '../shared/encode.js';
import { scan, splitTop } from '../shared/framework.js';
import { convertCoreUtility } from './core.js';
import { parseModifiers } from './modifiers.js';

/** Splits on top-level `:` only, so `[&:hover]` and `calc(a:b)` stay whole. */
function splitByTopLevelColon(token: string): string[] | null {
	try {
		return splitTop(scan(token), ':');
	} catch {
		return null;
	}
}

function format0buildToken(ctx: ClassContext, base: string, value?: string): string {
	try {
		const encodedBase = encodeProperty(ctx, base);
		return value !== undefined ? `${encodedBase}=${value}` : encodedBase;
	} catch {
		// Multi-word static utility names that `encoder` rejects.
		const dark = ctx.isDark ? 'dark:' : '';
		const bp = ctx.prefix ? `${String(ctx.prefix)}:` : '';
		const pseudoCls = ctx.pseudoClasses.map((p) => `:${p}`).join('');
		const pseudoEl = ctx.pseudoElement ? `::${ctx.pseudoElement}` : '';
		const val = value !== undefined ? `=${value}` : '';
		return `${dark}${bp}${base}${pseudoCls}${pseudoEl}${val}`;
	}
}

/** Converts one Tailwind token into a 0build token (or several, space-joined). */
export function convertToken(token: string): { converted: string } | { error: string } {
	const segments = splitByTopLevelColon(token);
	if (!segments || segments.length === 0) {
		return { error: 'Malformed utility token' };
	}

	const core = segments[segments.length - 1];
	if (!core) {
		return { error: 'Malformed utility token' };
	}

	const variants = parseModifiers(segments.slice(0, -1));
	if (!variants.ok) {
		return { error: variants.reason };
	}

	const result = convertCoreUtility(core);
	if (!result.ok) {
		return { error: result.reason };
	}

	const specs =
		result.tokens && result.tokens.length > 0
			? result.tokens
			: [{ base: result.base, value: result.value }];

	return {
		converted: specs.map((s) => format0buildToken(variants.value, s.base, s.value)).join(' ')
	};
}
