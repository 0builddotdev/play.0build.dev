import { encoder, scan, splitTop, type Breakpoint } from './runtime/functions.js';
import {
	BREAKPOINTS,
	COLORS,
	INTENSITIES,
	PSEUDO_CLASSES,
	PSEUDO_ELEMENTS
} from './runtime/registry/common.js';
import { CC, RULES, SCALED } from './runtime/registry/rules.js';

export { BREAKPOINTS, COLORS, INTENSITIES, PSEUDO_CLASSES, PSEUDO_ELEMENTS };

export const DISPLAY_MAP: Record<string, string> = Object.fromEntries(
	[
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
	].map((value) => [value, `display-${value}`])
);

const COLOR_SET = new Set<string>(COLORS);
const INTENSITY_SET = new Set<number>(INTENSITIES);
const PSEUDO_CLASS_SET = new Set<string>(
	PSEUDO_CLASSES.map((p) => (p.startsWith(':') ? p.slice(1) : p))
);
const PSEUDO_ELEMENT_SET = new Set<string>(
	PSEUDO_ELEMENTS.map((p) => (p.startsWith('::') ? p.slice(2) : p.startsWith(':') ? p.slice(1) : p))
);

// Named single-word colors supported across color and /o utilities
const NAMED_COLORS = new Set<string>(['white', 'black', 'transparent', 'current', 'inherit']);

// Tailwind v4 gradient color interpolation modifiers -> 0build underscored syntax
const GRADIENT_INTERPOLATION_MAP: Record<string, string> = {
	srgb: 'in_srgb',
	hsl: 'in_hsl',
	oklab: 'in_oklab',
	oklch: 'in_oklch',
	longer: 'in_oklch_longer_hue',
	shorter: 'in_oklch_shorter_hue',
	increasing: 'in_oklch_increasing_hue',
	decreasing: 'in_oklch_decreasing_hue'
};

// Linear gradient direction shorthands -> CSS direction words (underscored)
const LINEAR_DIRECTION_CSS_MAP: Record<string, string> = {
	t: 'to_top',
	tr: 'to_top_right',
	r: 'to_right',
	br: 'to_bottom_right',
	b: 'to_bottom',
	bl: 'to_bottom_left',
	l: 'to_left',
	tl: 'to_top_left'
};

// Color-accepting prefixes mapped from Tailwind prefix -> 0build property name
export const COLOR_PREFIX_MAP: Record<string, string> = {
	...Object.fromEntries(
		RULES.filter((rule) => rule.dark === true && !rule.selector.endsWith('/o')).map((rule) => [
			rule.selector === 'color' ? 'text' : rule.selector,
			rule.selector
		])
	),
	text: 'color'
};

// Static 0build utilities that stay identical (except for modifier placement)
const STATIC_UTILITIES = new Set([...CC, ...RULES.map((rule) => rule.selector)]);

export interface UnconvertedReport {
	token: string;
	reason: string;
	count: number;
}

export interface ConversionResult {
	output: string;
	totalTokens: number;
	convertedCount: number;
	reports: UnconvertedReport[];
}

/**
 * Splits a Tailwind token on top-level `:` characters using `scan` + `splitTop` from `functions.ts`.
 */
function splitByTopLevelColon(token: string): string[] | null {
	try {
		return splitTop(scan(token), ':');
	} catch {
		return null;
	}
}

/**
 * Formats a 0build token using `encoder()` from `runtime/functions.ts`.
 */
function format0buildToken(opts: {
	isDark: boolean;
	breakpoint: Breakpoint | null;
	base: string;
	pseudoClasses: string[];
	pseudoElement: string | null;
	value?: string;
}): string {
	try {
		const encodedBase = encoder({
			isDark: opts.isDark,
			prefix: opts.breakpoint,
			property: opts.base,
			pseudoClasses: opts.pseudoClasses,
			pseudoElement: opts.pseudoElement,
			value: null,
			important: false
		});
		return opts.value !== undefined ? `${encodedBase}=${opts.value}` : encodedBase;
	} catch {
		// Fallback for multi-word static utility names that don't use `encoder` property validation
		const darkPrefix = opts.isDark ? 'dark:' : '';
		const bpPrefix = opts.breakpoint ? `${String(opts.breakpoint)}:` : '';
		const pseudoCls = opts.pseudoClasses.map((p) => `:${p}`).join('');
		const pseudoEl = opts.pseudoElement ? `::${opts.pseudoElement}` : '';
		const valPart = opts.value !== undefined ? `=${opts.value}` : '';

		return `${darkPrefix}${bpPrefix}${opts.base}${pseudoCls}${pseudoEl}${valPart}`;
	}
}

interface CoreTokenSpec {
	base: string;
	value?: string;
}

interface CoreMatch {
	ok: true;
	base: string;
	value?: string;
	tokens?: CoreTokenSpec[];
}

interface CoreFail {
	ok: false;
	reason: string;
}

function normalizeOpacityToPercent(
	rawOpacity: string
): { ok: true; value: string } | { ok: false; reason: string } {
	const trimmed = rawOpacity.trim();
	const unbracketed =
		trimmed.startsWith('[') && trimmed.endsWith(']') ? trimmed.slice(1, -1).trim() : trimmed;

	const match = unbracketed.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))(%?)$/);
	if (!match) {
		return {
			ok: false,
			reason: `Invalid opacity modifier "/${rawOpacity}" (expected percentage or decimal like /50, /50%, or /0.5)`
		};
	}

	const [, numStr, pctSign] = match;
	const num = Number(numStr);
	if (Number.isNaN(num)) {
		return {
			ok: false,
			reason: `Invalid opacity value "${rawOpacity}"`
		};
	}

	let pct: number;
	if (pctSign === '%') {
		pct = num;
	} else if (num >= 0 && num <= 1) {
		pct = Number((num * 100).toFixed(4));
	} else {
		pct = num;
	}

	if (pct < 0 || pct > 100) {
		return {
			ok: false,
			reason: `Opacity value "${rawOpacity}" must resolve between 0% and 100%`
		};
	}

	return { ok: true, value: `${pct}%` };
}

function resolveGradientInterpolation(
	rawInterp?: string
): { ok: true; value: string } | { ok: false; reason: string } {
	if (!rawInterp) {
		return { ok: true, value: 'in_oklab' };
	}

	if (rawInterp.startsWith('[') && rawInterp.endsWith(']')) {
		const inner = rawInterp.slice(1, -1).trim();
		if (!inner) {
			return { ok: false, reason: 'Empty arbitrary gradient interpolation modifier' };
		}
		return { ok: true, value: inner };
	}

	if (rawInterp in GRADIENT_INTERPOLATION_MAP) {
		return { ok: true, value: GRADIENT_INTERPOLATION_MAP[rawInterp] };
	}

	return {
		ok: false,
		reason: `Unsupported gradient interpolation modifier "/${rawInterp}"`
	};
}

function isGradientStopPositionValue(rawVal: string): boolean {
	return (
		/^-?(?:\d+(?:\.\d+)?|\.\d+)(%|px|rem|em|vh|vw|dvh|dvw|svh|svw|lvh|lvw|ch|ex|cm|mm|in|pt|pc)$/.test(
			rawVal
		) || rawVal.startsWith('calc(')
	);
}

function convertGradientUtility(core: string): CoreMatch | CoreFail | null {
	const linearDirMatch = core.match(/^bg-(?:linear|gradient)-to-(t|tr|r|br|b|bl|l|tl)(?:\/(.+))?$/);
	if (linearDirMatch) {
		const [, dir, rawInterp] = linearDirMatch;
		if (!rawInterp) {
			return {
				ok: true,
				base: 'linear',
				tokens: [{ base: 'linear' }, { base: `linear-to-${dir}` }]
			};
		}
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return {
			ok: true,
			base: 'linear',
			value: `${LINEAR_DIRECTION_CSS_MAP[dir]}_${interpRes.value}`
		};
	}

	const linearAngleMatch = core.match(/^(-?)bg-linear-(\d+(?:\.\d+)?)(?:\/(.+))?$/);
	if (linearAngleMatch) {
		const [, neg, angle, rawInterp] = linearAngleMatch;
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return {
			ok: true,
			base: 'linear',
			value: `${neg}${angle}deg_${interpRes.value}`
		};
	}

	const linearArbMatch = core.match(/^bg-linear-\[([^\]]+)\](?:\/(.+))?$/);
	if (linearArbMatch) {
		const [, rawVal, rawInterp] = linearArbMatch;
		if (rawVal.trim() === '') {
			return { ok: false, reason: 'Empty arbitrary linear gradient value' };
		}
		if (!rawInterp) {
			return { ok: true, base: 'linear', value: rawVal };
		}
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return { ok: true, base: 'linear', value: `${rawVal}_${interpRes.value}` };
	}

	const radialBareMatch = core.match(/^bg-radial(?:\/(.+))?$/);
	if (radialBareMatch) {
		const [, rawInterp] = radialBareMatch;
		if (!rawInterp) {
			return { ok: true, base: 'radial' };
		}
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return { ok: true, base: 'radial', value: interpRes.value };
	}

	const radialArbMatch = core.match(/^bg-radial-\[([^\]]+)\](?:\/(.+))?$/);
	if (radialArbMatch) {
		const [, rawVal, rawInterp] = radialArbMatch;
		if (rawVal.trim() === '') {
			return { ok: false, reason: 'Empty arbitrary radial gradient value' };
		}
		if (!rawInterp) {
			return { ok: true, base: 'radial', value: rawVal };
		}
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return { ok: true, base: 'radial', value: `${rawVal}_${interpRes.value}` };
	}

	const conicBareMatch = core.match(/^bg-conic(?:\/(.+))?$/);
	if (conicBareMatch) {
		const [, rawInterp] = conicBareMatch;
		if (!rawInterp) {
			return { ok: true, base: 'conic' };
		}
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return { ok: true, base: 'conic', value: interpRes.value };
	}

	const conicAngleMatch = core.match(/^(-?)bg-conic-(\d+(?:\.\d+)?)(?:\/(.+))?$/);
	if (conicAngleMatch) {
		const [, neg, angle, rawInterp] = conicAngleMatch;
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return {
			ok: true,
			base: 'conic',
			value: `from_${neg}${angle}deg_${interpRes.value}`
		};
	}

	const conicArbMatch = core.match(/^bg-conic-\[([^\]]+)\](?:\/(.+))?$/);
	if (conicArbMatch) {
		const [, rawVal, rawInterp] = conicArbMatch;
		if (rawVal.trim() === '') {
			return { ok: false, reason: 'Empty arbitrary conic gradient value' };
		}
		if (!rawInterp) {
			return { ok: true, base: 'conic', value: rawVal };
		}
		const interpRes = resolveGradientInterpolation(rawInterp);
		if (!interpRes.ok) return interpRes;
		return { ok: true, base: 'conic', value: `${rawVal}_${interpRes.value}` };
	}

	const stopPosMatch = core.match(/^(from|via|to)-(\d+(?:\.\d+)?%)$/);
	if (stopPosMatch) {
		const [, stop, pct] = stopPosMatch;
		return {
			ok: true,
			base: `${stop}-position`,
			value: pct
		};
	}

	return null;
}

function convertColorUtility(core: string): CoreMatch | CoreFail | null {
	const colorMatch = core.match(
		/^(text|bg|border(?:-[trblsexy])?|outline|ring|inset-ring|shadow|decoration|accent|caret|fill|stroke|from|via|to)-([a-z]+)(?:-(\d+))?(?:\/(.+))?$/
	);
	if (!colorMatch) {
		return null;
	}

	const [, prefix, colorName, intensityStr, opacityRaw] = colorMatch;
	const targetBase = COLOR_PREFIX_MAP[prefix];
	if (!targetBase) {
		return null;
	}

	let resolvedColor: string;

	if (intensityStr !== undefined) {
		if (!COLOR_SET.has(colorName)) {
			return {
				ok: false,
				reason: `Color "${colorName}" is not in the supported 0build color list`
			};
		}
		const intensityNum = Number(intensityStr);
		if (!INTENSITY_SET.has(intensityNum)) {
			return {
				ok: false,
				reason: `Color intensity "${intensityStr}" is not supported (must be 50–950)`
			};
		}
		resolvedColor = `${colorName}-${intensityNum}`;
	} else if (NAMED_COLORS.has(colorName)) {
		resolvedColor = colorName;
	} else if (COLOR_SET.has(colorName)) {
		return {
			ok: false,
			reason: `Color "${colorName}" must include a supported intensity shade (50–950, e.g. ${colorName}-500)`
		};
	} else {
		return null;
	}

	if (opacityRaw === undefined) {
		return {
			ok: true,
			base: targetBase,
			value: resolvedColor
		};
	}

	const opacityRes = normalizeOpacityToPercent(opacityRaw);
	if (!opacityRes.ok) {
		return opacityRes;
	}

	return {
		ok: true,
		base: `${targetBase}/o`,
		value: `${resolvedColor}/${opacityRes.value}`
	};
}

function convertCoreUtility(core: string): CoreMatch | CoreFail {
	if (core in DISPLAY_MAP) {
		return { ok: true, base: DISPLAY_MAP[core] };
	}

	if (STATIC_UTILITIES.has(core)) {
		return { ok: true, base: core };
	}

	if (core === 'grow') {
		return { ok: true, base: 'grow-1' };
	}
	if (core === 'shrink') {
		return { ok: true, base: 'shrink-1' };
	}

	const gradientResult = convertGradientUtility(core);
	if (gradientResult !== null) {
		return gradientResult;
	}

	const arbitraryMatch = core.match(/^(-?)([a-zA-Z0-9-]+)-\[([^\]]+)\](?:\/(.+))?$/);
	if (arbitraryMatch) {
		const [, neg, prop, rawVal, opacityRaw] = arbitraryMatch;
		if (rawVal.trim() === '') {
			return { ok: false, reason: 'Empty arbitrary value' };
		}
		const value = neg ? `-${rawVal}` : rawVal;

		if (!neg && !opacityRaw && (prop === 'from' || prop === 'via' || prop === 'to')) {
			if (isGradientStopPositionValue(rawVal)) {
				return { ok: true, base: `${prop}-position`, value: rawVal };
			}
		}

		const isArbitraryColorValue =
			rawVal.startsWith('#') ||
			rawVal.startsWith('rgb') ||
			rawVal.startsWith('hsl') ||
			rawVal.startsWith('oklch') ||
			rawVal.startsWith('oklab') ||
			rawVal.startsWith('var(--color');

		if (prop === 'text') {
			if (isArbitraryColorValue) {
				if (opacityRaw !== undefined) {
					const opRes = normalizeOpacityToPercent(opacityRaw);
					if (!opRes.ok) return opRes;
					return { ok: true, base: 'color/o', value: `${value}/${opRes.value}` };
				}
				return { ok: true, base: 'color', value };
			}
			if (opacityRaw !== undefined) {
				return {
					ok: false,
					reason: `Opacity modifier "/${opacityRaw}" is not supported on font-size`
				};
			}
			return { ok: true, base: 'font-size', value };
		}

		if (prop in COLOR_PREFIX_MAP) {
			const targetBase = COLOR_PREFIX_MAP[prop];
			if (opacityRaw !== undefined) {
				const opRes = normalizeOpacityToPercent(opacityRaw);
				if (!opRes.ok) return opRes;
				return { ok: true, base: `${targetBase}/o`, value: `${value}/${opRes.value}` };
			}
			return { ok: true, base: targetBase, value };
		}

		if (opacityRaw !== undefined) {
			return {
				ok: false,
				reason: `Opacity modifier "/${opacityRaw}" is not supported for prefix "${prop}"`
			};
		}

		if (SCALED.has(prop)) {
			return { ok: true, base: `[${prop}]`, value };
		}
		if (prop === 'grid-cols' || prop === 'grid-rows') {
			return { ok: true, base: `[${prop}]`, value };
		}
		if (prop === 'opacity') {
			const opRes = normalizeOpacityToPercent(value);
			if (opRes.ok) {
				return { ok: true, base: 'opacity', value: opRes.value };
			}
			return { ok: true, base: 'opacity', value };
		}
		if (
			prop === 'z' ||
			prop === 'order' ||
			prop === 'aspect' ||
			prop === 'rounded' ||
			prop === 'tracking' ||
			prop === 'duration' ||
			prop === 'delay' ||
			prop === 'rotate' ||
			prop === 'scale' ||
			prop === 'skew-x' ||
			prop === 'skew-y'
		) {
			return { ok: true, base: prop, value };
		}

		return {
			ok: false,
			reason: `Arbitrary value not supported for prefix "${prop}"`
		};
	}

	const colorResult = convertColorUtility(core);
	if (colorResult !== null) {
		return colorResult;
	}

	const opacityPctMatch = core.match(/^opacity-(\d+(?:\.\d+)?%)$/);
	if (opacityPctMatch) {
		const opRes = normalizeOpacityToPercent(opacityPctMatch[1]);
		if (!opRes.ok) return opRes;
		return { ok: true, base: 'opacity', value: opRes.value };
	}

	const scaledMatch = core.match(/^(-?)([a-z-]+)-(\d+(?:\.\d+)?)$/);
	if (scaledMatch) {
		const [, neg, prop, numStr] = scaledMatch;
		if (SCALED.has(prop)) {
			const value = neg ? `-${numStr}` : numStr;
			return { ok: true, base: prop, value };
		}

		if (
			!neg &&
			(prop === 'grid-cols' ||
				prop === 'grid-rows' ||
				prop === 'col-span' ||
				prop === 'col-start' ||
				prop === 'col-end' ||
				prop === 'row-span' ||
				prop === 'row-start' ||
				prop === 'row-end' ||
				prop === 'columns')
		) {
			return { ok: true, base: prop, value: numStr };
		}

		if (prop === 'z' || prop === 'order') {
			return { ok: true, base: prop, value: neg ? `-${numStr}` : numStr };
		}

		if (!neg && prop === 'opacity') {
			const opRes = normalizeOpacityToPercent(numStr);
			if (!opRes.ok) return opRes;
			return { ok: true, base: 'opacity', value: opRes.value };
		}

		if (!neg && /^border(?:-[trblsexy])?$/.test(prop)) {
			return { ok: true, base: `${prop}-w`, value: `${numStr}px` };
		}

		if (!neg && (prop === 'ring' || prop === 'inset-ring' || prop === 'outline')) {
			return { ok: true, base: `${prop}-w`, value: `${numStr}px` };
		}
		if (!neg && prop === 'outline-offset') {
			return { ok: true, base: 'outline-offset', value: `${numStr}px` };
		}

		if (!neg && (prop === 'duration' || prop === 'delay')) {
			return { ok: true, base: prop, value: `${numStr}ms` };
		}

		if (prop === 'rotate' || prop === 'skew-x' || prop === 'skew-y') {
			return { ok: true, base: prop, value: `${neg ? '-' : ''}${numStr}deg` };
		}

		if (prop === 'scale' || prop === 'scale-x' || prop === 'scale-y') {
			return { ok: true, base: prop, value: `${neg ? '-' : ''}${numStr}%` };
		}
	}

	if (/^border(?:-[trblsexy])?$/.test(core)) {
		return { ok: true, base: `${core}-w`, value: '1px' };
	}

	if (core === 'rounded') {
		return { ok: true, base: 'rounded-sm' };
	}

	if (core === 'shadow') {
		return { ok: true, base: 'shadow-sm' };
	}

	if (/^-?[a-z-]+-\d+\/\d+$/.test(core)) {
		return {
			ok: false,
			reason:
				'Fractional values (e.g. 1/2) are not supported; use arbitrary percentage like w-[50%]'
		};
	}

	return {
		ok: false,
		reason: 'Unsupported or unrecognized Tailwind CSS utility'
	};
}

/**
 * Converts a single Tailwind CSS utility token into a 0build token (or space-joined tokens).
 */
export function convertToken(token: string): { converted: string } | { error: string } {
	const segments = splitByTopLevelColon(token);
	if (!segments || segments.length === 0) {
		return { error: 'Malformed utility token' };
	}

	const core = segments[segments.length - 1];
	const modifiers = segments.slice(0, -1);

	if (!core) {
		return { error: 'Malformed utility token' };
	}

	let isDark = false;
	let breakpoint: Breakpoint | null = null;
	const pseudoClasses: string[] = [];
	let pseudoElement: string | null = null;

	for (const mod of modifiers) {
		if (mod === 'dark') {
			isDark = true;
			continue;
		}

		if (mod.startsWith('max-')) {
			return { error: `Breakpoint modifier "${mod}:" is not supported (max-* is not supported)` };
		}

		if (mod in BREAKPOINTS) {
			if (breakpoint && breakpoint !== mod) {
				return {
					error: `Multiple breakpoint modifiers ("${String(breakpoint)}:" and "${mod}:") are not supported`
				};
			}
			breakpoint = mod as Breakpoint;
			continue;
		}

		if (PSEUDO_CLASS_SET.has(mod)) {
			if (pseudoClasses.length > 0) {
				return { error: 'Multiple pseudo-class modifiers on a single utility are not supported' };
			}
			pseudoClasses.push(mod);
			continue;
		}

		if (PSEUDO_ELEMENT_SET.has(mod)) {
			if (pseudoElement) {
				return { error: 'Multiple pseudo-element modifiers on a single utility are not supported' };
			}
			pseudoElement = mod;
			continue;
		}

		return {
			error: `Modifier "${mod}:" is not supported (only dark, sm–2xl, ${PSEUDO_CLASSES.join(', ')}, and ${PSEUDO_ELEMENTS.join('/')} are supported)`
		};
	}

	const coreResult = convertCoreUtility(core);
	if (!coreResult.ok) {
		return { error: coreResult.reason };
	}

	if (coreResult.tokens && coreResult.tokens.length > 0) {
		return {
			converted: coreResult.tokens
				.map((spec) =>
					format0buildToken({
						isDark,
						breakpoint,
						base: spec.base,
						pseudoClasses,
						pseudoElement,
						value: spec.value
					})
				)
				.join(' ')
		};
	}

	return {
		converted: format0buildToken({
			isDark,
			breakpoint,
			base: coreResult.base,
			pseudoClasses,
			pseudoElement,
			value: coreResult.value
		})
	};
}

/**
 * Converts either an HTML snippet (converting all `class="..."` / `className="..."` attributes)
 * or a plain whitespace-separated list of Tailwind CSS utilities.
 */
export function convertTailwindTo0build(input: string): ConversionResult {
	const reportMap = new Map<string, { reason: string; count: number }>();
	let totalTokens = 0;
	let convertedCount = 0;

	const processClassString = (classStr: string): string => {
		return classStr.replace(/\S+/g, (token) => {
			totalTokens++;
			const res = convertToken(token);
			if ('converted' in res) {
				convertedCount++;
				return res.converted;
			} else {
				const existing = reportMap.get(token);
				if (existing) {
					existing.count += 1;
				} else {
					reportMap.set(token, { reason: res.error, count: 1 });
				}
				return token;
			}
		});
	};

	const classAttrRegex = /\b(class(?:Name)?\s*=\s*)(["'])([\s\S]*?)\2/g;
	const hasClassAttributes = classAttrRegex.test(input);
	classAttrRegex.lastIndex = 0;

	let output: string;
	if (hasClassAttributes) {
		output = input.replace(
			classAttrRegex,
			(_full, prefix: string, quote: string, content: string) => {
				return `${prefix}${quote}${processClassString(content)}${quote}`;
			}
		);
	} else if (/<[a-zA-Z!/?]/.test(input)) {
		output = input;
	} else {
		output = processClassString(input);
	}

	const reports: UnconvertedReport[] = Array.from(reportMap.entries()).map(
		([token, { reason, count }]) => ({
			token,
			reason,
			count
		})
	);

	return {
		output,
		totalTokens,
		convertedCount,
		reports
	};
}
