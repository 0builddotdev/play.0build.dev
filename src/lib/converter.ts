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

/**
 * Normalizes a Tailwind opacity modifier or value (e.g. `50`, `50%`, `0.5`, `.5`, `[0.5]`, `[50%]`)
 * into a percentage string with a `%` suffix (e.g. `50%`) required by 0build's `/o` color-mix rules.
 *
 * Rules:
 * - Explicit `%` (e.g. `50%`, `[25%]`, `0.5%`): treated directly as percentage.
 * - Bare numbers `<= 1` (e.g. `0.5`, `.5`, `[0.5]`, `0`, `1`): treated as decimal opacity and multiplied by 100 (`0.5` -> `50%`).
 * - Bare numbers `> 1` (e.g. `50`, `75`, `2.5`, `100`): treated directly as percentage (`50` -> `50%`).
 */
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

/**
 * Resolves a Tailwind v4 gradient color interpolation modifier (after `/`) into 0build's underscored syntax.
 */
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

/**
 * Checks whether an arbitrary value in `from-[...]`, `via-[...]`, or `to-[...]` is a gradient stop position
 * rather than a color.
 */
function isGradientStopPositionValue(rawVal: string): boolean {
	return (
		/^-?(?:\d+(?:\.\d+)?|\.\d+)(%|px|rem|em|vh|vw|dvh|dvw|svh|svw|lvh|lvw|ch|ex|cm|mm|in|pt|pc)$/.test(
			rawVal
		) || rawVal.startsWith('calc(')
	);
}

/**
 * Converts Tailwind gradient utilities (`bg-linear-*`, `bg-gradient-*`, `bg-radial*`, `bg-conic*`,
 * and stop positions `from-40%`, `via-50%`, `to-75%`).
 * Returns `null` if `core` is not a gradient utility.
 */
function convertGradientUtility(core: string): CoreMatch | CoreFail | null {
	// 1. Directional linear gradients: `bg-linear-to-r`, `bg-linear-to-bl`, `bg-gradient-to-r`, optional `/modifier`
	const linearDirMatch = core.match(
		/^bg-(?:linear|gradient)-to-(t|tr|r|br|b|bl|l|tl)(?:\/(.+))?$/
	);
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

	// 2. Angled linear gradients: `bg-linear-65`, `-bg-linear-65`, `bg-linear-65/decreasing`
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

	// 3. Arbitrary linear gradients: `bg-linear-[...]`
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

	// 4. Radial gradients (bare or with interpolation): `bg-radial`, `bg-radial/decreasing`
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

	// 5. Arbitrary radial gradients: `bg-radial-[at_50%_75%]`, `bg-radial-[at_25%_25%]/decreasing`
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

	// 6. Conic gradients (bare or with interpolation): `bg-conic`, `bg-conic/decreasing`
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

	// 7. Angled conic gradients: `bg-conic-180`, `-bg-conic-90`, `bg-conic-180/decreasing`
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

	// 8. Arbitrary conic gradients: `bg-conic-[...]`
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

	// 9. Gradient stop positions: `from-40%` -> `from-position=40%`, `via-50%` -> `via-position=50%`, `to-75%` -> `to-position=75%`
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

/**
 * Converts Tailwind color utilities (including palette colors, named single-word colors, and `/opacity` modifiers).
 * Examples:
 * - `bg-pink-500` -> `bg=pink-500`
 * - `bg-pink-500/50` -> `bg/o=pink-500/50%`
 * - `bg-pink-500/0.5` -> `bg/o=pink-500/50%`
 * - `from-white` -> `from=white`
 * - `border-pink-500/50%` -> `border/o=pink-500/50%`
 * Returns `null` if `core` is not a color utility.
 */
function convertColorUtility(core: string): CoreMatch | CoreFail | null {
	const colorMatch = core.match(
		/^(text|bg|border(?:-[trblsexy])?|outline|ring|inset-ring|shadow|decoration|accent|caret|fill|stroke|from|via|to)-([a-z]+)(?:-(\d+))?(?:\/(.+))?$/
	);
	if (!colorMatch) {
		return null;
	}

	const [, prefix, colorName, intensityStr, opacityRaw] = colorMatch;
	const targetBase = COLOR_PREFIX_MAP[prefix];

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
		// Not a recognized color token (e.g. `bg-cover`, `border-collapse`)
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

	// 4. Gradient utilities (`bg-linear-*`, `bg-radial*`, `bg-conic*`, `from-40%`, `to-75%`, etc.)
	const gradientResult = convertGradientUtility(core);
	if (gradientResult !== null) {
		return gradientResult;
	}

	// 5. Arbitrary value utilities: e.g. `m-[1px]`, `-mt-[4px]`, `bg-[#ff0000]`, `bg-[#ff0000]/50`, `text-[14px]`, `w-[200px]`
	const arbitraryMatch = core.match(/^(-?)([a-zA-Z0-9-]+)-\[([^\]]+)\](?:\/(.+))?$/);
	if (arbitraryMatch) {
		const [, neg, prop, rawVal, opacityRaw] = arbitraryMatch;
		if (rawVal.trim() === '') {
			return { ok: false, reason: 'Empty arbitrary value' };
		}
		const value = neg ? `-${rawVal}` : rawVal;

		// Gradient stop arbitrary positions: `from-[40%]`, `via-[50%]`, `to-[75%]`
		if (!neg && !opacityRaw && (prop === 'from' || prop === 'via' || prop === 'to')) {
			if (isGradientStopPositionValue(rawVal)) {
				return { ok: true, base: `${prop}-position`, value: rawVal };
			}
		}

		// Handle arbitrary colors with optional `/opacity` modifier
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
				return { ok: false, reason: `Opacity modifier "/${opacityRaw}" is not supported on font-size` };
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

		if (SCALED_PROPERTIES.has(prop)) {
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

	// 6. Color & color-opacity utilities: e.g. `text-pink-500` -> `color=pink-500`, `bg-pink-500/50` -> `bg/o=pink-500/50%`
	const colorResult = convertColorUtility(core);
	if (colorResult !== null) {
		return colorResult;
	}

	// 7. Standalone percentage opacity utility: `opacity-50%` -> `opacity=50%`
	const opacityPctMatch = core.match(/^opacity-(\d+(?:\.\d+)?%)$/);
	if (opacityPctMatch) {
		const opRes = normalizeOpacityToPercent(opacityPctMatch[1]);
		if (!opRes.ok) return opRes;
		return { ok: true, base: 'opacity', value: opRes.value };
	}

	// 8. Scaled numeric spacing utilities: `m-1` -> `m=1`, `-mt-2` -> `mt=-2`, `p-4` -> `p=4`, `gap-x-2` -> `gap-x=2`, `w-10` -> `w=10`
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

		// Opacity: `opacity-50` -> `opacity=50%`, `opacity-0.5` -> `opacity=50%`
		if (!neg && prop === 'opacity') {
			const opRes = normalizeOpacityToPercent(numStr);
			if (!opRes.ok) return opRes;
			return { ok: true, base: 'opacity', value: opRes.value };
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

	// 9. Bare border width utilities: `border` -> `border-w=1px`, `border-t` -> `border-t-w=1px`
	if (/^border(?:-[trblsexy])?$/.test(core)) {
		return { ok: true, base: `${core}-w`, value: '1px' };
	}

	// 10. Bare rounded -> `rounded-sm`
	if (core === 'rounded') {
		return { ok: true, base: 'rounded-sm' };
	}

	// 11. Bare shadow -> `shadow-sm`
	if (core === 'shadow') {
		return { ok: true, base: 'shadow-sm' };
	}

	// 12. Fractional sizing like `w-1/2` -> unsupported in basic numeric multiplier unless arbitrary
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

	if (coreResult.tokens && coreResult.tokens.length > 0) {
		return {
			converted: coreResult.tokens
				.map((spec) =>
					format0buildToken({
						isDark,
						breakpoint,
						base: spec.base,
						pseudoClass,
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
