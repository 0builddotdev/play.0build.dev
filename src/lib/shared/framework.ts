/**
 * Single gateway to the 0build runtime.
 * Every other module imports runtime symbols from here, never from `../runtime/*`.
 */
export {
	decoder,
	encoder,
	scan,
	splitTop,
	variable,
	type Breakpoint,
	type ParsedClass
} from '../runtime/functions.js';
export {
	BREAKPOINTS,
	COLORS,
	INTENSITIES,
	PSEUDO_CLASSES,
	PSEUDO_ELEMENTS
} from '../runtime/registry/common.js';
export { CC, RULES, SCALED } from '../runtime/registry/rules.js';
