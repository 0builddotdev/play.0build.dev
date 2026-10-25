/** Document-level entry: converts every `class` / `className` attribute, or a bare class list. */
import { convertToken } from './token.js';

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

const CLASS_ATTR_RE = /\b(class(?:Name)?\s*=\s*)(["'])([\s\S]*?)\2/g;
const HTML_LIKE_RE = /<[a-zA-Z!/?]/;

/**
 * - HTML with class attributes → each attribute converted in place
 * - HTML without any         → returned untouched
 * - anything else            → treated as a whitespace-separated class list
 */
export function convertTailwindTo0build(input: string): ConversionResult {
	const failures = new Map<string, { reason: string; count: number }>();
	let totalTokens = 0;
	let convertedCount = 0;

	const convertClassList = (classList: string): string =>
		classList.replace(/\S+/g, (token) => {
			totalTokens++;
			const res = convertToken(token);
			if ('converted' in res) {
				convertedCount++;
				return res.converted;
			}
			const seen = failures.get(token);
			if (seen) {
				seen.count++;
			} else {
				failures.set(token, { reason: res.error, count: 1 });
			}
			return token;
		});

	let output: string;
	if (input.search(CLASS_ATTR_RE) !== -1) {
		output = input.replace(
			CLASS_ATTR_RE,
			(_full, prefix: string, quote: string, content: string) =>
				`${prefix}${quote}${convertClassList(content)}${quote}`
		);
	} else if (HTML_LIKE_RE.test(input)) {
		output = input;
	} else {
		output = convertClassList(input);
	}

	const reports: UnconvertedReport[] = Array.from(failures, ([token, { reason, count }]) => ({
		token,
		reason,
		count
	}));

	return { output, totalTokens, convertedCount, reports };
}
