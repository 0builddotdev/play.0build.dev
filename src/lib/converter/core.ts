/**
 * One Tailwind utility (no variants) → a 0build base/value.
 * Families are tried in a fixed order; the order is load-bearing
 * (e.g. `bg-red-500/50` would also match the "fraction" check, so fallbacks run last).
 */
import { DISPLAY_MAP } from '../shared/display.js';
import { CC, RULES } from '../shared/framework.js';
import { has } from '../shared/util.js';
import { convertArbitrary } from './arbitrary.js';
import { convertColorUtility } from './color.js';
import { convertGradientUtility } from './gradient.js';
import { convertNumeric, convertOpacityPercent } from './numeric.js';
import { fail, ok, type CoreResult } from './result.js';

/** Utilities that exist in 0build under the same name (variants are handled elsewhere). */
const STATIC_UTILITIES = new Set([...CC, ...RULES.map((rule) => rule.selector)]);

const BORDER_BARE_RE = /^border(?:-[trblsexy])?$/;
const FRACTION_RE = /^-?[a-z-]+-\d+\/\d+$/;

/** Tailwind keywords whose 0build spelling carries an explicit value. */
function convertKeyword(core: string): CoreResult | null {
	if (core === 'grow') {
		return ok('grow-1');
	}
	if (core === 'shrink') {
		return ok('shrink-1');
	}
	return null;
}

/** Last resort: bare-word defaults, then a precise error for fractions. */
function convertFallback(core: string): CoreResult | null {
	if (BORDER_BARE_RE.test(core)) {
		return ok(`${core}-w`, '1px');
	}
	if (core === 'rounded') {
		return ok('rounded-sm');
	}
	if (core === 'shadow') {
		return ok('shadow-sm');
	}
	if (FRACTION_RE.test(core)) {
		return fail(
			'Fractional values (e.g. 1/2) are not supported; use arbitrary percentage like w-[50%]'
		);
	}
	return null;
}

export function convertCoreUtility(core: string): CoreResult {
	if (has(DISPLAY_MAP, core)) {
		return ok(DISPLAY_MAP[core]);
	}
	if (STATIC_UTILITIES.has(core)) {
		return ok(core);
	}

	return (
		convertKeyword(core) ??
		convertGradientUtility(core) ??
		convertArbitrary(core) ??
		convertColorUtility(core) ??
		convertOpacityPercent(core) ??
		convertNumeric(core) ??
		convertFallback(core) ??
		fail('Unsupported or unrecognized Tailwind CSS utility')
	);
}
