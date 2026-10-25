/** Numeric-suffix utilities: `p-4`, `-z-10`, `border-2`, `duration-300`, `rotate-45`, `opacity-50%`. */
import { SCALED } from '../shared/framework.js';
import { has } from '../shared/util.js';
import { normalizeOpacityToPercent } from './opacity.js';
import { ok, type CoreResult } from './result.js';

const NUMERIC_RE = /^(-?)([a-z-]+)-(\d+(?:\.\d+)?)$/;
const OPACITY_PCT_RE = /^opacity-(\d+(?:\.\d+)?%)$/;
const BORDER_RE = /^border(?:-[trblsexy])?$/;

/** Plain number, no sign allowed. */
const GRID_NUMERIC = new Set([
	'grid-cols',
	'grid-rows',
	'col-span',
	'col-start',
	'col-end',
	'row-span',
	'row-start',
	'row-end',
	'columns'
]);
/** Plain number, sign allowed. */
const SIGNED_PLAIN = new Set(['z', 'order']);
/** `ring-3` → `ring-w=3px`. */
const WIDTH_PROPS = new Set(['ring', 'inset-ring', 'outline']);
/** Number + unit. `signed` says whether a leading `-` is legal. */
const UNITS: Record<string, { unit: string; signed: boolean }> = {
	'outline-offset': { unit: 'px', signed: false },
	duration: { unit: 'ms', signed: false },
	delay: { unit: 'ms', signed: false },
	rotate: { unit: 'deg', signed: true },
	'skew-x': { unit: 'deg', signed: true },
	'skew-y': { unit: 'deg', signed: true },
	scale: { unit: '%', signed: true },
	'scale-x': { unit: '%', signed: true },
	'scale-y': { unit: '%', signed: true }
};

/** `opacity-50%` → `opacity=50%`. Returns null when `core` isn't that shape. */
export function convertOpacityPercent(core: string): CoreResult | null {
	const m = OPACITY_PCT_RE.exec(core);
	if (!m) {
		return null;
	}
	const opacity = normalizeOpacityToPercent(m[1]);
	return opacity.ok ? ok('opacity', opacity.value) : opacity;
}

/** Returns null when nothing matches, so the caller can keep trying. Order matters. */
export function convertNumeric(core: string): CoreResult | null {
	const m = NUMERIC_RE.exec(core);
	if (!m) {
		return null;
	}

	const [, neg, prop, num] = m;
	const signed = neg ? `-${num}` : num;

	if (SCALED.has(prop)) {
		return ok(prop, signed);
	}
	if (!neg && GRID_NUMERIC.has(prop)) {
		return ok(prop, num);
	}
	if (SIGNED_PLAIN.has(prop)) {
		return ok(prop, signed);
	}

	if (!neg && prop === 'opacity') {
		const opacity = normalizeOpacityToPercent(num);
		return opacity.ok ? ok('opacity', opacity.value) : opacity;
	}

	if (!neg && (BORDER_RE.test(prop) || WIDTH_PROPS.has(prop))) {
		return ok(`${prop}-w`, `${num}px`);
	}

	const unit = has(UNITS, prop) ? UNITS[prop] : undefined;
	if (unit && (unit.signed || !neg)) {
		return ok(prop, `${signed}${unit.unit}`);
	}

	return null;
}
