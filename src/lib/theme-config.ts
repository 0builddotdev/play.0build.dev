export type TokenValue = string | number;

export type Layer = 'light' | 'dark';

export interface Theme {
	id: string;
	name: string;
	group: string;
	enabled: boolean;
	light: Record<string, TokenValue>;
	dark: Record<string, TokenValue>;
}

export interface PersistedThemeState {
	mode?: 'basic' | 'advanced';
	themes: Theme[];
	activeId: string;
	editMode: Layer;
	customCss?: string | null;
}

export const STORAGE_KEY = '__Z_THEME_BUILDER__';

export const DEFAULTS: Record<Layer, Record<string, TokenValue>> = {
	light: {
		bg: '#fff',
		'bg-f': 'oklch(21% 0.006 285.885)',
		card: '#fff',
		'card-f': 'oklch(21% 0.006 285.885)',
		drop: '#fff',
		'drop-f': 'oklch(21% 0.006 285.885)',
		primary: 'oklch(27.4% 0.006 286.033)',
		'primary-f': 'oklch(98.5% 0 0)',
		secondary: '#000',
		'secondary-o': 4,
		'secondary-f': 'oklch(21% 0.006 285.885)',
		muted: '#000',
		'muted-o': 4,
		'muted-f': 'oklch(44.2% 0.017 285.786)',
		accent: '#000',
		'accent-o': 4,
		'accent-f': 'oklch(21% 0.006 285.885)',
		danger: 'oklch(63.7% 0.237 25.331)',
		'danger-f': 'oklch(50.5% 0.213 27.518)',
		info: 'oklch(62.3% 0.214 259.815)',
		'info-f': 'oklch(48.8% 0.243 264.376)',
		success: 'oklch(69.6% 0.17 162.48)',
		'success-f': 'oklch(50.8% 0.118 165.612)',
		warning: 'oklch(76.9% 0.188 70.08)',
		'warning-f': 'oklch(55.5% 0.163 48.998)',
		border: '#000',
		'border-o': 10,
		input: '#000',
		'input-o': 10,
		focus: 'oklch(70.5% 0.015 286.067)',
		'chart-1': 'oklch(64.6% 0.222 41.116)',
		'chart-2': 'oklch(60% 0.118 184.704)',
		'chart-3': 'oklch(30.2% 0.056 229.695)',
		'chart-4': 'oklch(82.8% 0.189 84.429)',
		'chart-5': 'oklch(76.9% 0.188 70.08)',
		'global-blur': '4px',
		'global-font-size': '1rem',
		'global-line-height': '1.5rem',
		'global-font-size-small': '0.875rem',
		'global-line-height-small': '1.25rem',
		'global-radius': '0.375rem',
		'global-radius-small': '0.125rem',
		'global-shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
		'global-shadow-small': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		'interactive-height-multiplier': 2.5,
		'interactive-padding-block-multiplier': 0.625,
		'interactive-padding-inline-multiplier': 1.25
	},
	dark: {
		bg: 'oklch(14.1% 0.005 285.823)',
		'bg-f': 'oklch(96.7% 0.001 286.375)',
		card: '#151518',
		'card-f': 'oklch(96.7% 0.001 286.375)',
		drop: 'oklch(21% 0.006 285.885)',
		'drop-f': 'oklch(96.7% 0.001 286.375)',
		primary: 'oklch(96.7% 0.001 286.375)',
		'primary-f': 'oklch(21% 0.006 285.885)',
		secondary: '#fff',
		'secondary-o': 8,
		'secondary-f': 'oklch(96.7% 0.001 286.375)',
		muted: '#fff',
		'muted-o': 8,
		'muted-f': 'oklch(70.5% 0.015 286.067)',
		accent: '#fff',
		'accent-o': 8,
		'accent-f': 'oklch(96.7% 0.001 286.375)',
		danger: 'oklch(63.7% 0.237 25.331)',
		'danger-f': 'oklch(70.4% 0.191 22.216)',
		info: 'oklch(62.3% 0.214 259.815)',
		'info-f': 'oklch(70.7% 0.165 254.624)',
		success: 'oklch(69.6% 0.17 162.48)',
		'success-f': 'oklch(76.5% 0.177 163.223)',
		warning: 'oklch(76.9% 0.188 70.08)',
		'warning-f': 'oklch(82.8% 0.189 84.429)',
		border: '#fff',
		'border-o': 12,
		input: '#fff',
		'input-o': 12,
		focus: 'oklch(55.2% 0.016 285.938)',
		'chart-1': 'oklch(48.8% 0.243 264.376)',
		'chart-2': 'oklch(69.6% 0.17 162.48)',
		'chart-3': 'oklch(76.9% 0.188 70.08)',
		'chart-4': 'oklch(62.7% 0.265 303.9)',
		'chart-5': 'oklch(59.2% 0.249 0.584)'
	}
};

export const COLOR_TOKENS = new Set([
	'bg',
	'bg-f',
	'card',
	'card-f',
	'drop',
	'drop-f',
	'primary',
	'primary-f',
	'secondary',
	'secondary-f',
	'muted',
	'muted-f',
	'accent',
	'accent-f',
	'danger',
	'danger-f',
	'info',
	'info-f',
	'success',
	'success-f',
	'warning',
	'warning-f',
	'border',
	'input',
	'focus',
	'chart-1',
	'chart-2',
	'chart-3',
	'chart-4',
	'chart-5'
]);

export const MULTIPLIER_TOKENS = new Set([
	'interactive-height-multiplier',
	'interactive-padding-block-multiplier',
	'interactive-padding-inline-multiplier'
]);

export const GROUPS: { label: string; vars: string[] }[] = [
	{ label: 'Surfaces', vars: ['bg', 'bg-f', 'card', 'card-f', 'drop', 'drop-f'] },
	{
		label: 'Core',
		vars: [
			'primary',
			'primary-f',
			'secondary',
			'secondary-o',
			'secondary-f',
			'muted',
			'muted-o',
			'muted-f',
			'accent',
			'accent-o',
			'accent-f'
		]
	},
	{
		label: 'Status',
		vars: ['danger', 'danger-f', 'info', 'info-f', 'success', 'success-f', 'warning', 'warning-f']
	},
	{ label: 'Border / Input / Focus', vars: ['border', 'border-o', 'input', 'input-o', 'focus'] },
	{ label: 'Charts', vars: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] },
	{ label: 'Spacing & Radius', vars: ['global-radius', 'global-radius-small'] },
	{ label: 'Effects', vars: ['global-blur'] },
	{ label: 'Shadows', vars: ['global-shadow', 'global-shadow-small'] },
	{
		label: 'Typography',
		vars: [
			'global-font-size',
			'global-line-height',
			'global-font-size-small',
			'global-line-height-small'
		]
	},
	{
		label: 'Interactive Components',
		vars: [
			'interactive-height-multiplier',
			'interactive-padding-block-multiplier',
			'interactive-padding-inline-multiplier'
		]
	}
];

export const KNOWN_TOKENS = new Set(GROUPS.flatMap((g) => g.vars));
