/**
 * Compatibility facade: keeps `import … from './rewriter.js'` working.
 * New code should import from `./rewriter/index.js`.
 * Delete any legacy re-export below once nothing imports it.
 */
export * from './rewriter/index.js';
export {
	COLORS as COLOR_NAMES,
	INTENSITIES as COLOR_SHADES,
	PSEUDO_CLASSES,
	PSEUDO_ELEMENTS,
	SCALED
} from './shared/framework.js';
