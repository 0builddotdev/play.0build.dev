/**
 * Pair conversion between the three spellings of one 0build declaration:
 *   shorthand  `bg:hover=green`        (class)
 *   proper     `bg:hover` + `--bg-hover: green`   (class + style)
 *   x-ui       `u="bg:hover=green"`
 * All three go through the canonical `Pair`.
 */
import { colorNameFromVar, resolveColor } from '../shared/color.js';
import { encodeProperty } from '../shared/encode.js';
import { decoder, SCALED, variable, type ParsedClass } from '../shared/framework.js';
import { lastTopLevelSlash } from './text.js';
import type { Pair } from './types.js';

const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;

/** A value the runtime would treat as raw CSS rather than a scale step. */
const needsRaw = (value: string): boolean => !PLAIN_NUMBER.test(value) && !value.includes('{{');

/** CSS variable name for a parsed class, via the runtime's `variable()`. */
function cssVarFromParsed(parsed: ParsedClass, nameOverride?: string): string {
	return variable({
		isDark: parsed.isDark,
		prefix: parsed.prefix,
		name: nameOverride ?? parsed.property,
		pseudoClasses: parsed.pseudoClasses,
		pseudoElement: parsed.pseudoElement
	});
}

/** `dark:sm:bg:hover=green` / `bg/o=pink-500/80` / `m=4px` → canonical pair. */
export function fromShorthand(key: string, value: string): Pair | null {
	const res = decoder(key, { allowBare: true });
	if (!res.ok) {
		return null;
	}

	let parsed = res.value;

	if (parsed.property.endsWith('/o')) {
		const baseProp = parsed.property.slice(0, -2);
		const baseVar = cssVarFromParsed(parsed, baseProp);
		const slash = lastTopLevelSlash(value);
		const color = slash === -1 ? value : value.slice(0, slash);
		const opacity = slash === -1 ? '' : value.slice(slash + 1);
		const vars: Array<[string, string]> = [[baseVar, resolveColor(color)]];
		if (opacity) {
			const opacityVar = cssVarFromParsed(parsed, `${baseProp}-o`);
			vars.push([opacityVar, PLAIN_NUMBER.test(opacity) ? `${opacity}%` : opacity]);
		}
		return { cls: parsed.fullClass, vars };
	}

	// `m=4px` on a scaled property means the arbitrary form `[m]`.
	if (!parsed.property.startsWith('[') && SCALED.has(parsed.property) && needsRaw(value)) {
		const redecoded = decoder(encodeProperty(parsed, `[${parsed.property}]`), { allowBare: true });
		if (redecoded.ok) {
			parsed = redecoded.value;
		}
	}

	return { cls: parsed.fullClass, vars: [[cssVarFromParsed(parsed), resolveColor(value)]] };
}

/** A plain class token whose `--var` is declared in `style`. */
export function fromProper(token: string, vars: Map<string, string>): Pair | null {
	const res = decoder(token, { allowBare: true });
	if (!res.ok) {
		return null;
	}

	const parsed = res.value;

	if (parsed.property.endsWith('/o')) {
		const baseProp = parsed.property.slice(0, -2);
		const colorVar = cssVarFromParsed(parsed, baseProp);
		const opacityVar = cssVarFromParsed(parsed, `${baseProp}-o`);
		const colorValue = vars.get(colorVar);
		const opacityValue = vars.get(opacityVar);
		if (colorValue === undefined || opacityValue === undefined) {
			return null;
		}
		return {
			cls: parsed.fullClass,
			vars: [
				[colorVar, colorValue],
				[opacityVar, opacityValue]
			]
		};
	}

	const name = cssVarFromParsed(parsed);
	const value = vars.get(name);
	return value === undefined ? null : { cls: parsed.fullClass, vars: [[name, value]] };
}

/**
 * Canonical pair → `key` / `value` for the shorthand and x-ui forms.
 * Returns null when it can't be written faithfully as shorthand.
 */
export function toShort(pair: Pair): { key: string; value: string } | null {
	const res = decoder(pair.cls, { allowBare: true });
	if (!res.ok) {
		return null;
	}

	const parsed = res.value;

	if (parsed.property.endsWith('/o')) {
		if (pair.vars.length !== 2) {
			return null;
		}
		const rawColor = pair.vars[0]![1];
		const color = colorNameFromVar(rawColor) ?? rawColor;
		const opacity = /^(\d+(?:\.\d+)?)%$/.exec(pair.vars[1]![1]);
		if (!opacity || !color) {
			return null;
		}
		return { key: parsed.fullClass, value: `${color}/${opacity[1]}` };
	}

	if (pair.vars.length !== 1) {
		return null;
	}
	const value = pair.vars[0]![1];
	if (!value) {
		return null;
	}

	let key = parsed.fullClass;
	if (parsed.property.startsWith('[') && parsed.property.endsWith(']')) {
		const inner = parsed.property.slice(1, -1);
		if (SCALED.has(inner) && needsRaw(value)) {
			key = encodeProperty(parsed, inner);
		}
	} else if (SCALED.has(parsed.property) && needsRaw(value)) {
		// `m` + `--m: 4px` would become `[m]` once the runtime resolves `m=4px`.
		// That changes the meaning, so keep it in proper form.
		return null;
	}

	return { key, value: colorNameFromVar(value) ?? value };
}
