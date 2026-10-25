/** Arbitrary-value utilities: `w-[calc(100%-1rem)]`, `text-[#fff]/50`, `-mt-[3px]`, … */
import { SCALED } from '../shared/framework.js';
import { has } from '../shared/util.js';
import { COLOR_PREFIX_MAP, colorWithOpacity } from './color.js';
import { isGradientStopPositionValue } from './gradient.js';
import { normalizeOpacityToPercent } from './opacity.js';
import { fail, ok, type CoreResult } from './result.js';

const ARBITRARY_RE = /^(-?)([a-zA-Z0-9-]+)-\[([^\]]+)\](?:\/(.+))?$/;

const STOP_PREFIXES = new Set(['from', 'via', 'to']);
const GRID_TRACKS = new Set(['grid-cols', 'grid-rows']);
/** Prefixes whose arbitrary value maps 1:1 onto the same 0build property. */
const PASSTHROUGH = new Set([
	'z',
	'order',
	'aspect',
	'rounded',
	'tracking',
	'duration',
	'delay',
	'rotate',
	'scale',
	'skew-x',
	'skew-y'
]);
const COLOR_VALUE_STARTS = ['#', 'rgb', 'hsl', 'oklch', 'oklab', 'var(--color'];

const isColorValue = (v: string): boolean => COLOR_VALUE_STARTS.some((s) => v.startsWith(s));

/** Returns null when `core` has no `[...]` value. Once it matches, it always returns a result. */
export function convertArbitrary(core: string): CoreResult | null {
	const m = ARBITRARY_RE.exec(core);
	if (!m) {
		return null;
	}

	const [, neg, prop, rawVal, opacityRaw] = m;
	if (rawVal.trim() === '') {
		return fail('Empty arbitrary value');
	}
	const value = neg ? `-${rawVal}` : rawVal;

	if (!neg && !opacityRaw && STOP_PREFIXES.has(prop) && isGradientStopPositionValue(rawVal)) {
		return ok(`${prop}-position`, rawVal);
	}

	// `text-[…]` is a color when the value looks like one, otherwise a font size.
	if (prop === 'text') {
		if (isColorValue(rawVal)) {
			return colorWithOpacity('color', value, opacityRaw);
		}
		if (opacityRaw !== undefined) {
			return fail(`Opacity modifier "/${opacityRaw}" is not supported on font-size`);
		}
		return ok('font-size', value);
	}

	if (has(COLOR_PREFIX_MAP, prop)) {
		return colorWithOpacity(COLOR_PREFIX_MAP[prop], value, opacityRaw);
	}

	if (opacityRaw !== undefined) {
		return fail(`Opacity modifier "/${opacityRaw}" is not supported for prefix "${prop}"`);
	}

	if (SCALED.has(prop) || GRID_TRACKS.has(prop)) {
		return ok(`[${prop}]`, value);
	}

	if (prop === 'opacity') {
		const opacity = normalizeOpacityToPercent(value);
		return ok('opacity', opacity.ok ? opacity.value : value);
	}

	if (PASSTHROUGH.has(prop)) {
		return ok(prop, value);
	}

	return fail(`Arbitrary value not supported for prefix "${prop}"`);
}
