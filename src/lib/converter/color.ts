/** Tailwind color utilities (`bg-red-500/50`, `border-t-white`, …) → 0build. */
import { COLOR_SET, INTENSITY_SET, NAMED_COLORS } from '../shared/color.js';
import { RULES } from '../shared/framework.js';
import { normalizeOpacityToPercent } from './opacity.js';
import { fail, ok, type CoreResult } from './result.js';

/** Tailwind prefix → 0build property name, for every color-accepting rule. */
export const COLOR_PREFIX_MAP: Record<string, string> = {
	...Object.fromEntries(
		RULES.filter((rule) => rule.dark === true && !rule.selector.endsWith('/o')).map((rule) => [
			rule.selector === 'color' ? 'text' : rule.selector,
			rule.selector
		])
	),
	text: 'color'
};

/** `base` + `color`, switching to `<base>/o` and `<color>/<pct>%` when an opacity modifier exists. */
export function colorWithOpacity(
	base: string,
	color: string,
	opacityRaw: string | undefined
): CoreResult {
	if (opacityRaw === undefined) {
		return ok(base, color);
	}
	const opacity = normalizeOpacityToPercent(opacityRaw);
	return opacity.ok ? ok(`${base}/o`, `${color}/${opacity.value}`) : opacity;
}

const COLOR_UTILITY_RE =
	/^(text|bg|border(?:-[trblsexy])?|outline|ring|inset-ring|shadow|decoration|accent|caret|fill|stroke|from|via|to)-([a-z]+)(?:-(\d+))?(?:\/(.+))?$/;

/** Returns null when `core` is not a color utility. */
export function convertColorUtility(core: string): CoreResult | null {
	const m = COLOR_UTILITY_RE.exec(core);
	if (!m) {
		return null;
	}

	const [, prefix, colorName, intensityStr, opacityRaw] = m;
	const targetBase = COLOR_PREFIX_MAP[prefix];
	if (!targetBase) {
		return null;
	}

	let resolvedColor: string;
	if (intensityStr !== undefined) {
		if (!COLOR_SET.has(colorName)) {
			return fail(`Color "${colorName}" is not in the supported 0build color list`);
		}
		const intensity = Number(intensityStr);
		if (!INTENSITY_SET.has(intensity)) {
			return fail(`Color intensity "${intensityStr}" is not supported (must be 50–950)`);
		}
		resolvedColor = `${colorName}-${intensity}`;
	} else if (NAMED_COLORS.has(colorName)) {
		resolvedColor = colorName;
	} else if (COLOR_SET.has(colorName)) {
		return fail(
			`Color "${colorName}" must include a supported intensity shade (50–950, e.g. ${colorName}-500)`
		);
	} else {
		return null;
	}

	return colorWithOpacity(targetBase, resolvedColor, opacityRaw);
}
