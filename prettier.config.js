/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	plugins: [
		'prettier-plugin-svelte',
		'prettier-plugin-curly',
		'@ianvs/prettier-plugin-sort-imports'
	],
	importOrder: ['^svelte(/.*|$)', '^@?(?!src)(?!\\.).*$', '^\\$lib(/.*|$)', '^\\.\\./', '^\\./'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }]
};

export default config;
