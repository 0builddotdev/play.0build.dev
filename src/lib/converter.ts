/**
 * Compatibility facade: keeps `import … from './converter.js'` working.
 * New code should import from `./converter/index.js`.
 * Delete any legacy re-export below once nothing imports it.
 */
export * from './converter/index.js';
export {
	BREAKPOINTS,
	COLORS,
	INTENSITIES,
	PSEUDO_CLASSES,
	PSEUDO_ELEMENTS
} from './shared/framework.js';
