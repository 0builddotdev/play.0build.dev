/** Tailwind v4 gradient utilities → 0build (`linear`, `radial`, `conic`, `from/via/to-position`). */
import { has } from '../shared/util.js';
import { fail, ok, type CoreResult, type Parsed } from './result.js';

/** Tailwind interpolation modifier → 0build underscored syntax. */
const INTERPOLATION: Record<string, string> = {
	srgb: 'in_srgb',
	hsl: 'in_hsl',
	oklab: 'in_oklab',
	oklch: 'in_oklch',
	longer: 'in_oklch_longer_hue',
	shorter: 'in_oklch_shorter_hue',
	increasing: 'in_oklch_increasing_hue',
	decreasing: 'in_oklch_decreasing_hue'
};

/** Direction shorthand → CSS direction words (underscored). */
const LINEAR_DIRECTION: Record<string, string> = {
	t: 'to_top',
	tr: 'to_top_right',
	r: 'to_right',
	br: 'to_bottom_right',
	b: 'to_bottom',
	bl: 'to_bottom_left',
	l: 'to_left',
	tl: 'to_top_left'
};

type Kind = 'linear' | 'radial' | 'conic';

const DIRECTION_RE = /^bg-(?:linear|gradient)-to-(t|tr|r|br|b|bl|l|tl)(?:\/(.+))?$/;
const LINEAR_ANGLE_RE = /^(-?)bg-linear-(\d+(?:\.\d+)?)(?:\/(.+))?$/;
const CONIC_ANGLE_RE = /^(-?)bg-conic-(\d+(?:\.\d+)?)(?:\/(.+))?$/;
const ARBITRARY_RE = /^bg-(linear|radial|conic)-\[([^\]]+)\](?:\/(.+))?$/;
const BARE_RE = /^bg-(radial|conic)(?:\/(.+))?$/;
const STOP_POSITION_RE = /^(from|via|to)-(\d+(?:\.\d+)?%)$/;

function resolveInterpolation(raw?: string): Parsed<string> {
	if (!raw) {
		return { ok: true, value: 'in_oklab' };
	}

	if (raw.startsWith('[') && raw.endsWith(']')) {
		const inner = raw.slice(1, -1).trim();
		return inner
			? { ok: true, value: inner }
			: fail('Empty arbitrary gradient interpolation modifier');
	}

	if (has(INTERPOLATION, raw)) {
		return { ok: true, value: INTERPOLATION[raw] };
	}
	return fail(`Unsupported gradient interpolation modifier "/${raw}"`);
}

/**
 * Builds `value` as `<head>_<interpolation>`.
 *  - `head` null           → the interpolation alone
 *  - no modifier given     → `withDefault` ? append `in_oklab` : leave `head` as is
 */
function gradient(
	base: Kind,
	head: string | null,
	rawInterp: string | undefined,
	withDefault: boolean
): CoreResult {
	if (rawInterp === undefined && !withDefault) {
		return head === null ? ok(base) : ok(base, head);
	}
	const interp = resolveInterpolation(rawInterp);
	if (!interp.ok) {
		return interp;
	}
	return ok(base, head === null ? interp.value : `${head}_${interp.value}`);
}

export function isGradientStopPositionValue(rawVal: string): boolean {
	return (
		/^-?(?:\d+(?:\.\d+)?|\.\d+)(%|px|rem|em|vh|vw|dvh|dvw|svh|svw|lvh|lvw|ch|ex|cm|mm|in|pt|pc)$/.test(
			rawVal
		) || rawVal.startsWith('calc(')
	);
}

/** Returns null when `core` is not a gradient utility. */
export function convertGradientUtility(core: string): CoreResult | null {
	let m = DIRECTION_RE.exec(core);
	if (m) {
		const [, dir, interp] = m;
		if (!interp) {
			return {
				ok: true,
				base: 'linear',
				tokens: [{ base: 'linear' }, { base: `linear-to-${dir}` }]
			};
		}
		return gradient('linear', LINEAR_DIRECTION[dir], interp, false);
	}

	m = LINEAR_ANGLE_RE.exec(core);
	if (m) {
		return gradient('linear', `${m[1]}${m[2]}deg`, m[3], true);
	}

	m = CONIC_ANGLE_RE.exec(core);
	if (m) {
		return gradient('conic', `from_${m[1]}${m[2]}deg`, m[3], true);
	}

	m = ARBITRARY_RE.exec(core);
	if (m) {
		const [, kind, rawVal, interp] = m;
		if (rawVal.trim() === '') {
			return fail(`Empty arbitrary ${kind} gradient value`);
		}
		return gradient(kind as Kind, rawVal, interp, false);
	}

	m = BARE_RE.exec(core);
	if (m) {
		return gradient(m[1] as Kind, null, m[2], false);
	}

	m = STOP_POSITION_RE.exec(core);
	if (m) {
		return ok(`${m[1]}-position`, m[2]);
	}

	return null;
}
