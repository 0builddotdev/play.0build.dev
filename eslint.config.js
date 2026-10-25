import path from 'node:path';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		plugins: {
			'@stylistic': stylistic
		},
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			'@stylistic/padding-line-between-statements': [
				'error',
				// Always require a blank line BEFORE 'if', 'for', 'while', 'switch', 'try', and 'return'
				{ blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'switch', 'try', 'return'] },

				// Always require a blank line AFTER variable declarations (const, let, var)
				{ blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },

				// ALLOW variables to sit next to each other without spaces so they stay grouped
				{ blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		// Override or add rule settings here, such as:
		// 'svelte/button-has-type': 'error'
		rules: {}
	}
);
