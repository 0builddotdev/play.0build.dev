export const DISPLAY_MAP: Record<string, string> = {
	block: 'display-block',
	'inline-block': 'display-inline-block',
	inline: 'display-inline',
	flex: 'display-flex',
	'inline-flex': 'display-inline-flex',
	table: 'display-table',
	'inline-table': 'display-inline-table',
	'table-caption': 'display-table-caption',
	'table-cell': 'display-table-cell',
	'table-column': 'display-table-column',
	'table-column-group': 'display-table-column-group',
	'table-footer-group': 'display-table-footer-group',
	'table-header-group': 'display-table-header-group',
	'table-row-group': 'display-table-row-group',
	'table-row': 'display-table-row',
	'flow-root': 'display-flow-root',
	grid: 'display-grid',
	'inline-grid': 'display-inline-grid',
	contents: 'display-contents',
	'list-item': 'display-list-item',
	hidden: 'display-hidden'
};

export const PSEUDO_CLASSES = [
	':hover',
	':active',
	':focus',
	':focus-visible',
	':focus-within',
	':target',
	':checked',
	':disabled',
	':group-hover'
] as const;

export const PSEUDO_ELEMENTS = ['::before', '::after'] as const;

export const COLORS = [
	'red',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'emerald',
	'teal',
	'cyan',
	'sky',
	'blue',
	'indigo',
	'violet',
	'purple',
	'fuchsia',
	'pink',
	'rose',
	'slate',
	'gray',
	'zinc',
	'neutral',
	'stone',
	'taupe',
	'mauve',
	'mist',
	'olive'
] as const;

export const INTENSITIES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const BREAKPOINTS: Record<string, string> = {
	sm: '40rem',
	md: '48rem',
	lg: '64rem',
	xl: '80rem',
	'2xl': '96rem'
};

const COLOR_SET = new Set<string>(COLORS);
const INTENSITY_SET = new Set<number>(INTENSITIES);
const PSEUDO_CLASS_SET = new Set<string>(PSEUDO_CLASSES.map((p) => p.slice(1)));
const PSEUDO_ELEMENT_SET = new Set<string>(PSEUDO_ELEMENTS.map((p) => p.slice(2)));

// Properties that use calc(var(--spacing) * var(--prop)) for numeric scales and [prop]=val for arbitrary values
const SCALED_PROPERTIES = new Set([
	'm',
	'mt',
	'mb',
	'ml',
	'mr',
	'ms',
	'me',
	'mx',
	'my',
	'p',
	'pt',
	'pb',
	'pl',
	'pr',
	'ps',
	'pe',
	'px',
	'py',
	'gap',
	'gap-x',
	'gap-y',
	'w',
	'h',
	'size',
	'min-w',
	'min-h',
	'max-w',
	'max-h',
	'inset',
	'inset-x',
	'inset-y',
	'top',
	'right',
	'bottom',
	'left',
	'start',
	'end',
	'basis',
	'indent',
	'leading',
	'scroll-m',
	'scroll-mt',
	'scroll-mb',
	'scroll-ml',
	'scroll-mr',
	'scroll-ms',
	'scroll-me',
	'scroll-mx',
	'scroll-my',
	'scroll-p',
	'scroll-pt',
	'scroll-pb',
	'scroll-pl',
	'scroll-pr',
	'scroll-ps',
	'scroll-pe',
	'scroll-px',
	'scroll-py',
	'translate',
	'translate-x',
	'translate-y',
	'translate-z',
	'border-spacing',
	'border-spacing-x',
	'border-spacing-y'
]);

// Color-accepting prefixes mapped from Tailwind prefix -> 0build property name
const COLOR_PREFIX_MAP: Record<string, string> = {
	text: 'color',
	bg: 'bg',
	border: 'border',
	'border-t': 'border-t',
	'border-r': 'border-r',
	'border-b': 'border-b',
	'border-l': 'border-l',
	'border-s': 'border-s',
	'border-e': 'border-e',
	'border-x': 'border-x',
	'border-y': 'border-y',
	outline: 'outline',
	ring: 'ring',
	'inset-ring': 'inset-ring',
	shadow: 'shadow',
	decoration: 'decoration',
	accent: 'accent',
	caret: 'caret',
	fill: 'fill',
	stroke: 'stroke',
	from: 'from',
	via: 'via',
	to: 'to'
};

// Static 0build utilities that stay identical (except for modifier placement)
const STATIC_UTILITIES = new Set([
	// Position
	'static',
	'fixed',
	'absolute',
	'relative',
	'sticky',
	// Visibility & Isolation
	'visible',
	'invisible',
	'collapse',
	'isolate',
	'isolation-auto',
	// Flexbox & Grid alignment / flow
	'flex-1',
	'flex-auto',
	'flex-initial',
	'flex-none',
	'flex-row',
	'flex-row-reverse',
	'flex-col',
	'flex-col-reverse',
	'flex-wrap',
	'flex-wrap-reverse',
	'flex-nowrap',
	'grow-0',
	'grow-1',
	'shrink-0',
	'shrink-1',
	'items-start',
	'items-end',
	'items-center',
	'items-baseline',
	'items-stretch',
	'items-end-safe',
	'items-center-safe',
	'items-baseline-last',
	'justify-normal',
	'justify-start',
	'justify-end',
	'justify-center',
	'justify-between',
	'justify-around',
	'justify-evenly',
	'justify-stretch',
	'justify-end-safe',
	'justify-center-safe',
	'justify-items-start',
	'justify-items-end',
	'justify-items-center',
	'justify-items-stretch',
	'justify-items-normal',
	'justify-self-auto',
	'justify-self-start',
	'justify-self-end',
	'justify-self-center',
	'justify-self-stretch',
	'content-normal',
	'content-center',
	'content-start',
	'content-end',
	'content-between',
	'content-around',
	'content-evenly',
	'content-baseline',
	'content-stretch',
	'self-auto',
	'self-start',
	'self-end',
	'self-center',
	'self-stretch',
	'self-baseline',
	'place-content-center',
	'place-content-start',
	'place-content-end',
	'place-content-between',
	'place-content-around',
	'place-content-evenly',
	'place-content-baseline',
	'place-content-stretch',
	'place-items-start',
	'place-items-end',
	'place-items-center',
	'place-items-baseline',
	'place-items-stretch',
	'place-self-auto',
	'place-self-start',
	'place-self-end',
	'place-self-center',
	'place-self-stretch',
	'grid-flow-row',
	'grid-flow-col',
	'grid-flow-dense',
	'grid-flow-row-dense',
	'grid-flow-col-dense',
	'grid-cols-none',
	'grid-cols-subgrid',
	'grid-rows-none',
	'grid-rows-subgrid',
	'col-auto',
	'col-span-full',
	'col-start-auto',
	'col-end-auto',
	'row-auto',
	'row-span-full',
	'row-start-auto',
	'row-end-auto',
	'auto-cols-auto',
	'auto-cols-min',
	'auto-cols-max',
	'auto-cols-fr',
	'auto-rows-auto',
	'auto-rows-min',
	'auto-rows-max',
	'auto-rows-fr',
	// Sizing & Auto margins
	'm-auto',
	'mt-auto',
	'mb-auto',
	'ml-auto',
	'mr-auto',
	'ms-auto',
	'me-auto',
	'mx-auto',
	'my-auto',
	'w-auto',
	'w-full',
	'w-screen',
	'w-dvw',
	'w-dvh',
	'w-lvw',
	'w-lvh',
	'w-svw',
	'w-svh',
	'w-min',
	'w-max',
	'w-fit',
	'w-3xs',
	'w-2xs',
	'w-xs',
	'w-sm',
	'w-md',
	'w-lg',
	'w-xl',
	'w-2xl',
	'w-3xl',
	'w-4xl',
	'w-5xl',
	'w-6xl',
	'w-7xl',
	'h-auto',
	'h-full',
	'h-screen',
	'h-dvh',
	'h-dvw',
	'h-lvh',
	'h-lvw',
	'h-svh',
	'h-svw',
	'h-min',
	'h-max',
	'h-fit',
	'h-lh',
	'size-auto',
	'size-full',
	'size-dvw',
	'size-dvh',
	'size-lvw',
	'size-lvh',
	'size-svw',
	'size-svh',
	'size-min',
	'size-max',
	'size-fit',
	'min-w-auto',
	'min-w-full',
	'min-w-screen',
	'min-w-min',
	'min-w-max',
	'min-w-fit',
	'min-w-3xs',
	'min-w-2xs',
	'min-w-xs',
	'min-w-sm',
	'min-w-md',
	'min-w-lg',
	'min-w-xl',
	'min-w-2xl',
	'min-w-3xl',
	'min-w-4xl',
	'min-w-5xl',
	'min-w-6xl',
	'min-w-7xl',
	'min-h-auto',
	'min-h-full',
	'min-h-screen',
	'min-h-min',
	'min-h-max',
	'min-h-fit',
	'min-h-lh',
	'max-w-none',
	'max-w-full',
	'max-w-screen',
	'max-w-min',
	'max-w-max',
	'max-w-fit',
	'max-w-3xs',
	'max-w-2xs',
	'max-w-xs',
	'max-w-sm',
	'max-w-md',
	'max-w-lg',
	'max-w-xl',
	'max-w-2xl',
	'max-w-3xl',
	'max-w-4xl',
	'max-w-5xl',
	'max-w-6xl',
	'max-w-7xl',
	'max-h-none',
	'max-h-full',
	'max-h-screen',
	'max-h-min',
	'max-h-max',
	'max-h-fit',
	'max-h-lh',
	'basis-auto',
	'basis-full',
	'basis-3xs',
	'basis-2xs',
	'basis-xs',
	'basis-sm',
	'basis-md',
	'basis-lg',
	'basis-xl',
	'basis-2xl',
	'basis-3xl',
	'basis-4xl',
	'basis-5xl',
	'basis-6xl',
	'basis-7xl',
	'top-auto',
	'top-full',
	'right-auto',
	'right-full',
	'bottom-auto',
	'bottom-full',
	'left-auto',
	'left-full',
	'inset-auto',
	'inset-full',
	'inset-x-full',
	'inset-y-full',
	'start-full',
	'end-full',
	'z-auto',
	// Typography
	'text-xs',
	'text-sm',
	'text-base',
	'text-lg',
	'text-xl',
	'text-2xl',
	'text-3xl',
	'text-4xl',
	'text-5xl',
	'text-6xl',
	'text-7xl',
	'text-8xl',
	'text-9xl',
	'font-thin',
	'font-extralight',
	'font-light',
	'font-normal',
	'font-medium',
	'font-semibold',
	'font-bold',
	'font-extrabold',
	'font-black',
	'font-sans',
	'font-serif',
	'font-mono',
	'italic',
	'not-italic',
	'underline',
	'overline',
	'line-through',
	'no-underline',
	'uppercase',
	'lowercase',
	'capitalize',
	'normal-case',
	'truncate',
	'text-ellipsis',
	'text-clip',
	'text-wrap',
	'text-nowrap',
	'text-balance',
	'text-pretty',
	'text-left',
	'text-center',
	'text-right',
	'text-justify',
	'text-start',
	'text-end',
	'leading-none',
	'leading-tight',
	'leading-snug',
	'leading-normal',
	'leading-relaxed',
	'leading-loose',
	'tracking-tighter',
	'tracking-tight',
	'tracking-normal',
	'tracking-wide',
	'tracking-wider',
	'tracking-widest',
	'antialiased',
	'subpixel-antialiased',
	'whitespace-normal',
	'whitespace-nowrap',
	'whitespace-pre',
	'whitespace-pre-line',
	'whitespace-pre-wrap',
	'whitespace-break-spaces',
	'break-normal',
	'break-words',
	'break-all',
	'break-keep',
	'list-inside',
	'list-outside',
	'list-none',
	'list-disc',
	'list-decimal',
	// Borders & Radius
	'rounded-none',
	'rounded-xs',
	'rounded-sm',
	'rounded-md',
	'rounded-lg',
	'rounded-xl',
	'rounded-2xl',
	'rounded-3xl',
	'rounded-4xl',
	'rounded-full',
	'rounded-t-none',
	'rounded-t-xs',
	'rounded-t-sm',
	'rounded-t-md',
	'rounded-t-lg',
	'rounded-t-xl',
	'rounded-t-2xl',
	'rounded-t-3xl',
	'rounded-t-full',
	'rounded-r-none',
	'rounded-r-xs',
	'rounded-r-sm',
	'rounded-r-md',
	'rounded-r-lg',
	'rounded-r-xl',
	'rounded-r-2xl',
	'rounded-r-3xl',
	'rounded-r-full',
	'rounded-b-none',
	'rounded-b-xs',
	'rounded-b-sm',
	'rounded-b-md',
	'rounded-b-lg',
	'rounded-b-xl',
	'rounded-b-2xl',
	'rounded-b-3xl',
	'rounded-b-full',
	'rounded-l-none',
	'rounded-l-xs',
	'rounded-l-sm',
	'rounded-l-md',
	'rounded-l-lg',
	'rounded-l-xl',
	'rounded-l-2xl',
	'rounded-l-3xl',
	'rounded-l-full',
	'border-solid',
	'border-dashed',
	'border-dotted',
	'border-double',
	'border-hidden',
	'border-none',
	'outline-none',
	'outline-hidden',
	'outline-dashed',
	'outline-dotted',
	'outline-double',
	// Effects & Shadows & Transitions
	'shadow-2xs',
	'shadow-xs',
	'shadow-sm',
	'shadow-md',
	'shadow-lg',
	'shadow-xl',
	'shadow-none',
	'blur-none',
	'blur-xs',
	'blur-sm',
	'blur-md',
	'blur-lg',
	'blur-xl',
	'blur-2xl',
	'blur-3xl',
	'backdrop-blur-none',
	'backdrop-blur-xs',
	'backdrop-blur-sm',
	'backdrop-blur-md',
	'backdrop-blur-lg',
	'backdrop-blur-xl',
	'backdrop-blur-2xl',
	'backdrop-blur-3xl',
	'transition-all',
	'transition-colors',
	'transition-opacity',
	'transition-shadow',
	'transition-transform',
	'transition-none',
	'ease-linear',
	'ease-in',
	'ease-out',
	'ease-in-out',
	'animate-none',
	'animate-spin',
	'animate-ping',
	'animate-pulse',
	'animate-bounce',
	// Overflow, Object, Interactivity
	'overflow-auto',
	'overflow-hidden',
	'overflow-clip',
	'overflow-visible',
	'overflow-scroll',
	'overflow-x-auto',
	'overflow-y-auto',
	'overflow-x-hidden',
	'overflow-y-hidden',
	'overflow-x-clip',
	'overflow-y-clip',
	'overflow-x-visible',
	'overflow-y-visible',
	'overflow-x-scroll',
	'overflow-y-scroll',
	'object-contain',
	'object-cover',
	'object-fill',
	'object-none',
	'object-scale-down',
	'object-bottom',
	'object-center',
	'object-left',
	'object-right',
	'object-top',
	'aspect-auto',
	'aspect-square',
	'aspect-video',
	'box-border',
	'box-content',
	'cursor-auto',
	'cursor-default',
	'cursor-pointer',
	'cursor-wait',
	'cursor-text',
	'cursor-move',
	'cursor-help',
	'cursor-not-allowed',
	'cursor-none',
	'cursor-grab',
	'cursor-grabbing',
	'pointer-events-none',
	'pointer-events-auto',
	'select-none',
	'select-text',
	'select-all',
	'select-auto',
	'resize-none',
	'resize',
	'resize-x',
	'resize-y',
	'appearance-none',
	'appearance-auto'
]);

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
 * Splits a Tailwind token on top-level `:` characters (ignoring colons inside `[...]`).
 */
function splitByTopLevelColon(token: string): string[] {
	const parts: string[] = [];
	let current = '';
	let bracketDepth = 0;

	for (let i = 0; i < token.length; i++) {
		const ch = token[i];
		if (ch === '[') bracketDepth++;
		else if (ch === ']' && bracketDepth > 0) bracketDepth--;

		if (ch === ':' && bracketDepth === 0) {
			parts.push(current);
			current = '';
		} else {
			current += ch;
		}
	}
	parts.push(current);
	return parts;
}

function format0buildToken(opts: {
	isDark: boolean;
	breakpoint: string | null;
	base: string;
	pseudoClass: string | null;
	pseudoElement: string | null;
	value?: string;
}): string {
	const darkPrefix = opts.isDark ? 'dark:' : '';
	const bpPrefix = opts.breakpoint ? `${opts.breakpoint}:` : '';
	const pseudoCls = opts.pseudoClass ?? '';
	const pseudoEl = opts.pseudoElement ?? '';
	const valPart = opts.value !== undefined ? `=${opts.value}` : '';

	return `${darkPrefix}${bpPrefix}${opts.base}${pseudoCls}${pseudoEl}${valPart}`;
}

interface CoreMatch {
	ok: true;
	base: string;
	value?: string;
}

interface CoreFail {
	ok: false;
	reason: string;
}

function convertCoreUtility(core: string): CoreMatch | CoreFail {
	// 1. Display utilities (`block` -> `display-block`, `flex` -> `display-flex`, etc.)
	if (core in DISPLAY_MAP) {
		return { ok: true, base: DISPLAY_MAP[core] };
	}

	// 2. Static utilities that map 1:1
	if (STATIC_UTILITIES.has(core)) {
		return { ok: true, base: core };
	}

	// 3. Shorthand grow / shrink
	if (core === 'grow') {
		return { ok: true, base: 'grow-1' };
	}
	if (core === 'shrink') {
		return { ok: true, base: 'shrink-1' };
	}

	// 4. Arbitrary value utilities: e.g. `m-[1px]`, `-mt-[4px]`, `bg-[#ff0000]`, `text-[14px]`, `w-[200px]`
	const arbitraryMatch = core.match(/^(-?)([a-zA-Z0-9-]+)-\[([^\]]+)\]$/);
	if (arbitraryMatch) {
		const [, neg, prop, rawVal] = arbitraryMatch;
		if (rawVal.trim() === '') {
			return { ok: false, reason: 'Empty arbitrary value' };
		}
		const value = neg ? `-${rawVal}` : rawVal;

		if (SCALED_PROPERTIES.has(prop)) {
			return { ok: true, base: `[${prop}]`, value };
		}
		if (prop === 'grid-cols' || prop === 'grid-rows') {
			return { ok: true, base: `[${prop}]`, value };
		}
		if (prop === 'bg') {
			return { ok: true, base: 'bg', value };
		}
		if (prop === 'text') {
			// Distinguish arbitrary color vs font-size
			if (
				rawVal.startsWith('#') ||
				rawVal.startsWith('rgb') ||
				rawVal.startsWith('hsl') ||
				rawVal.startsWith('oklch') ||
				rawVal.startsWith('var(--color')
			) {
				return { ok: true, base: 'color', value };
			}
			return { ok: true, base: 'font-size', value };
		}
		if (prop in COLOR_PREFIX_MAP) {
			return { ok: true, base: COLOR_PREFIX_MAP[prop], value };
		}
		if (
			prop === 'z' ||
			prop === 'order' ||
			prop === 'opacity' ||
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

	// 5. Color utilities: e.g. `text-pink-500` -> `color=pink-500`, `bg-pink-500` -> `bg=pink-500`
	const colorMatch = core.match(
		/^(text|bg|border(?:-[trblsexy])?|outline|ring|inset-ring|shadow|decoration|accent|caret|fill|stroke|from|via|to)-([a-z]+)(?:-(\d+))?(?:\/(\d+))?$/
	);
	if (colorMatch) {
		const [, prefix, colorName, intensityStr, opacityStr] = colorMatch;

		if (opacityStr !== undefined) {
			return {
				ok: false,
				reason: `Color opacity modifier "/${opacityStr}" is not supported in basic conversion`
			};
		}

		// Check if this is actually a border width like `border-2` or `border-t-4`
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

			const targetBase = COLOR_PREFIX_MAP[prefix];
			return {
				ok: true,
				base: targetBase,
				value: `${colorName}-${intensityNum}`
			};
		}

		// Single-word colors like `text-white`, `bg-black`, `bg-transparent`, `text-current`
		if (
			colorName === 'white' ||
			colorName === 'black' ||
			colorName === 'transparent' ||
			colorName === 'current' ||
			colorName === 'inherit' ||
			COLOR_SET.has(colorName)
		) {
			return {
				ok: false,
				reason: `Color "${colorName}${intensityStr ? `-${intensityStr}` : ''}" must use a supported palette color and intensity (e.g. pink-500)`
			};
		}
	}

	// 6. Scaled numeric spacing utilities: `m-1` -> `m=1`, `-mt-2` -> `mt=-2`, `p-4` -> `p=4`, `gap-x-2` -> `gap-x=2`, `w-10` -> `w=10`
	const scaledMatch = core.match(/^(-?)([a-z-]+)-(\d+(?:\.\d+)?)$/);
	if (scaledMatch) {
		const [, neg, prop, numStr] = scaledMatch;
		if (SCALED_PROPERTIES.has(prop)) {
			const value = neg ? `-${numStr}` : numStr;
			return { ok: true, base: prop, value };
		}

		// Grid columns / rows / spans: `grid-cols-3` -> `grid-cols=3`, `col-span-2` -> `col-span=2`
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

		// Z-index & Order: `z-10` -> `z=10`, `-z-10` -> `z=-10`, `order-1` -> `order=1`
		if (prop === 'z' || prop === 'order') {
			return { ok: true, base: prop, value: neg ? `-${numStr}` : numStr };
		}

		// Opacity: `opacity-50` -> `opacity=50%`
		if (!neg && prop === 'opacity') {
			return { ok: true, base: 'opacity', value: `${numStr}%` };
		}

		// Border widths: `border-2` -> `border-w=2px`, `border-t-2` -> `border-t-w=2px`
		if (!neg && /^border(?:-[trblsexy])?$/.test(prop)) {
			return { ok: true, base: `${prop}-w`, value: `${numStr}px` };
		}

		// Ring / Outline widths & offsets
		if (!neg && (prop === 'ring' || prop === 'inset-ring' || prop === 'outline')) {
			return { ok: true, base: `${prop}-w`, value: `${numStr}px` };
		}
		if (!neg && prop === 'outline-offset') {
			return { ok: true, base: 'outline-offset', value: `${numStr}px` };
		}

		// Duration / Delay: `duration-200` -> `duration=200ms`
		if (!neg && (prop === 'duration' || prop === 'delay')) {
			return { ok: true, base: prop, value: `${numStr}ms` };
		}

		// Rotate / Skew: `rotate-45` -> `rotate=45deg`
		if (prop === 'rotate' || prop === 'skew-x' || prop === 'skew-y') {
			return { ok: true, base: prop, value: `${neg ? '-' : ''}${numStr}deg` };
		}

		// Scale: `scale-95` -> `scale=95%`
		if (prop === 'scale' || prop === 'scale-x' || prop === 'scale-y') {
			return { ok: true, base: prop, value: `${neg ? '-' : ''}${numStr}%` };
		}
	}

	// 7. Bare border width utilities: `border` -> `border-w=1px`, `border-t` -> `border-t-w=1px`
	if (/^border(?:-[trblsexy])?$/.test(core)) {
		return { ok: true, base: `${core}-w`, value: '1px' };
	}

	// 8. Bare rounded -> `rounded-sm`
	if (core === 'rounded') {
		return { ok: true, base: 'rounded-sm' };
	}

	// 9. Bare shadow -> `shadow-sm`
	if (core === 'shadow') {
		return { ok: true, base: 'shadow-sm' };
	}

	// 10. Fractional sizing like `w-1/2` -> unsupported in basic numeric multiplier unless arbitrary
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
 * Converts a single Tailwind CSS utility token into a 0build token.
 */
export function convertToken(token: string): { converted: string } | { error: string } {
	const segments = splitByTopLevelColon(token);
	const core = segments[segments.length - 1];
	const modifiers = segments.slice(0, -1);

	if (!core) {
		return { error: 'Malformed utility token' };
	}

	let isDark = false;
	let breakpoint: string | null = null;
	let pseudoClass: string | null = null;
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
					error: `Multiple breakpoint modifiers ("${breakpoint}:" and "${mod}:") are not supported`
				};
			}
			breakpoint = mod;
			continue;
		}

		if (PSEUDO_CLASS_SET.has(mod)) {
			if (pseudoClass) {
				return { error: 'Multiple pseudo-class modifiers on a single utility are not supported' };
			}
			pseudoClass = `:${mod}`;
			continue;
		}

		if (PSEUDO_ELEMENT_SET.has(mod)) {
			if (pseudoElement) {
				return { error: 'Multiple pseudo-element modifiers on a single utility are not supported' };
			}
			pseudoElement = `::${mod}`;
			continue;
		}

		return {
			error: `Modifier "${mod}:" is not supported (only dark, sm–2xl, ${PSEUDO_CLASSES.join(', ')}, and ::before/::after are supported)`
		};
	}

	const coreResult = convertCoreUtility(core);
	if (!coreResult.ok) {
		return { error: coreResult.reason };
	}

	return {
		converted: format0buildToken({
			isDark,
			breakpoint,
			base: coreResult.base,
			pseudoClass,
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
		// Preserve whitespace layout while replacing each non-whitespace token
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
		// HTML input without any class="..." attributes
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
