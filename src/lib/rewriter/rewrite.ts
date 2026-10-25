/** Walks the document, rewriting open tags and keeping closing tags balanced. */
import { analyze } from './analyze.js';
import { build } from './build.js';
import { RAW_TEXT, readOpenTag, VOID } from './html.js';
import type { RewriteMode, RewriteResult, StackEntry } from './types.js';

const CLOSE_TAG_RE = /<\/\s*([A-Za-z][\w:.-]*)\s*>/y;

function rewrite(input: string, mode: RewriteMode): { output: string; rewritten: number } {
	const lowerInput = input.toLowerCase();
	const stack: StackEntry[] = [];
	let out = '';
	let i = 0;
	let rewritten = 0;

	while (i < input.length) {
		const lt = input.indexOf('<', i);
		if (lt === -1) {
			out += input.slice(i);
			break;
		}
		out += input.slice(i, lt);

		if (input.startsWith('<!--', lt)) {
			const end = input.indexOf('-->', lt + 4);
			const stop = end === -1 ? input.length : end + 3;
			out += input.slice(lt, stop);
			i = stop;
			continue;
		}

		if (input[lt + 1] === '/') {
			CLOSE_TAG_RE.lastIndex = lt;
			const match = CLOSE_TAG_RE.exec(input);
			if (!match) {
				out += '<';
				i = lt + 1;
				continue;
			}
			let name = match[1]!.toLowerCase();
			if (name === 'xui') {
				name = 'x-ui';
			}
			let index = stack.length - 1;
			while (index >= 0 && stack[index]!.src !== name) {
				index--;
			}

			if (index === -1) {
				out += match[0];
			} else {
				const entry = stack[index]!;
				stack.length = index;
				if (entry.outName === null) {
					out += match[0];
				} else if (!entry.drop) {
					out += `</${entry.outName}>`;
				}
			}
			i = lt + match[0].length;
			continue;
		}

		const tag = readOpenTag(input, lt);
		if (!tag) {
			out += '<';
			i = lt + 1;
			continue;
		}

		const lower = tag.name.toLowerCase();
		const analysis = analyze(tag, mode);
		let outName: string | null = null;
		let drop = false;

		if (analysis) {
			if (analysis.hasPairs || analysis.hasDisplay) {
				rewritten++;
			}
			const built = build(tag, analysis, mode);
			out += built.text;
			outName = built.name;
			drop = built.drop;
		} else {
			out += tag.raw;
		}
		i = tag.end;

		if (tag.selfClosing || VOID.has(lower)) {
			continue;
		}

		if (RAW_TEXT.has(lower)) {
			const close = lowerInput.indexOf(`</${lower}`, i);
			if (close === -1) {
				out += input.slice(i);
				i = input.length;
			} else {
				const gt = input.indexOf('>', close);
				const stop = gt === -1 ? input.length : gt + 1;
				out += input.slice(i, stop);
				i = stop;
			}
			continue;
		}

		stack.push({ src: lower, outName, drop });
	}

	return { output: out, rewritten };
}

export function rewriteAll(input: string): RewriteResult {
	const proper = rewrite(input, 'proper');
	const xui = rewrite(input, 'xui');
	const shorthand = rewrite(input, 'shorthand');
	return {
		proper: proper.output,
		xui: xui.output,
		shorthand: shorthand.output,
		// The x-ui pass touches a superset of what the others do (it also rewrites lone `display-*`).
		rewritten: xui.rewritten
	};
}
