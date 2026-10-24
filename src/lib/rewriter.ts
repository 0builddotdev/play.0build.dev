/**
 * 0build rewriter
 *
 * Takes HTML that uses 0build in any of its three forms and rewrites it into:
 *   - proper     class="p" style="--p: 4"
 *   - shorthand  class="p=4"
 *   - x-ui       <x-ui class="..." u="p=4">   (Laravel component)
 *
 * Only elements that actually carry a 0build pair are rewritten (an `=` shorthand
 * token, a `u` attribute on <x-ui>, or a class that has its `--var` in `style`).
 * Everything else is copied through byte-for-byte.
 */

export type RewriteMode = 'proper' | 'xui' | 'shorthand';

export interface RewriteResult {
	proper: string;
	xui: string;
	shorthand: string;
	/** Number of elements that carried at least one 0build pair. */
	rewritten: number;
}

/* -------------------------------------------------------------------------- */
/*  Framework knowledge — adjust these to match the real 0build registry       */
/* -------------------------------------------------------------------------- */

/** Palette names that resolve `bg=pink-500` → `var(--color-pink-500)`. */
const COLOR_NAMES = [
	'slate',
	'gray',
	'zinc',
	'neutral',
	'stone',
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
	'rose'
];
const COLOR_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const COLOR_PATTERN = `(?:${COLOR_NAMES.join('|')})-(?:${COLOR_SHADES.join('|')})`;
const COLOR_RE = new RegExp(`^${COLOR_PATTERN}$`);
const COLOR_VAR_RE = new RegExp(`^var\\(--color-(${COLOR_PATTERN})\\)$`);

/** Utilities multiplied by `var(--spacing)`; raw values (`4px`) must go through `[prop]`. */
const SCALED = new Set([
	'm',
	'mx',
	'my',
	'mt',
	'mr',
	'mb',
	'ml',
	'ms',
	'me',
	'p',
	'px',
	'py',
	'pt',
	'pr',
	'pb',
	'pl',
	'ps',
	'pe',
	'gap',
	'gap-x',
	'gap-y',
	'space-x',
	'space-y',
	'size',
	'w',
	'h',
	'min-w',
	'min-h',
	'max-w',
	'max-h',
	'top',
	'right',
	'bottom',
	'left',
	'inset',
	'inset-x',
	'inset-y'
]);

/** Segments that are prefixes/states, i.e. NOT the utility itself. */
const MODIFIERS = new Set([
	'dark',
	'sm',
	'md',
	'lg',
	'xl',
	'2xl',
	'hover',
	'focus',
	'focus-visible',
	'focus-within',
	'active',
	'visited',
	'disabled',
	'checked',
	'first',
	'last',
	'odd',
	'even',
	'empty',
	'invalid',
	'placeholder',
	'before',
	'after'
]);

const VOID = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'source',
	'track',
	'wbr'
]);
const RAW_TEXT = new Set(['script', 'style']);

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Attr {
	name: string;
	value: string | null;
	raw: string;
}

interface OpenTag {
	name: string;
	attrs: Attr[];
	raw: string;
	end: number;
	selfClosing: boolean;
}

interface Decl {
	name: string;
	value: string;
	raw: string;
}

/** Canonical "proper" representation of one pair: a class token plus its CSS variables. */
interface Pair {
	cls: string;
	vars: Array<[string, string]>;
}

type Item = { kind: 'static'; token: string } | { kind: 'pair'; pair: Pair };

interface Analysis {
	/** The real HTML tag (`as` for <x-ui>, `div` by default). */
	tag: string;
	items: Item[];
	leftover: Decl[];
	isXui: boolean;
	hasPairs: boolean;
}

interface StackEntry {
	src: string;
	/** Name to close with, or null to copy the source closing tag untouched. */
	outName: string | null;
	/** True when the opening tag was emitted self-closed / void, so the closing tag is dropped. */
	drop: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                              */
/* -------------------------------------------------------------------------- */

const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;
const KEY_RE = /^[A-Za-z0-9_\-:/.[\]]+$/;
const ARBITRARY_PROP_RE = /^(?:[\w-]+:)*\[[^\]]+\](?::[\w-]+)*=\{(?!\{).*\}$/s;

const isWs = (c: string | undefined): boolean => c !== undefined && /\s/.test(c);

/** `[m]=4px`-style arbitrary properties stay in `class` untouched. */
const isArbitraryProp = (token: string): boolean => ARBITRARY_PROP_RE.test(token);

const needsRaw = (value: string): boolean => !PLAIN_NUMBER.test(value) && !value.includes('{{');

/** Whitespace outside Blade `{{ }}` interpolations. */
const hasWs = (value: string): boolean => /\s/.test(value.replace(/\{\{[\s\S]*?\}\}/g, ''));

const varName = (cls: string): string => '--' + cls.replace(/[[\]]/g, '').replace(/[:/]/g, '-');

const resolveColor = (value: string): string => (COLOR_RE.test(value) ? `var(--color-${value})` : value);

function propertyIndex(cls: string): number {
	return cls.split(':').findIndex((segment) => !MODIFIERS.has(segment));
}

function lastTopLevelSlash(value: string): number {
	let depth = 0;
	let index = -1;
	for (let i = 0; i < value.length; i++) {
		const c = value[i];
		if (c === '(' || c === '{' || c === '[') depth++;
		else if (c === ')' || c === '}' || c === ']') depth--;
		else if (c === '/' && depth === 0) index = i;
	}
	return index;
}

/** Split on whitespace, keeping Blade `{{ ... }}` blocks as one token. */
function tokenize(source: string): string[] {
	const tokens: string[] = [];
	let current = '';
	let i = 0;
	while (i < source.length) {
		if (source.startsWith('{{', i)) {
			const end = source.indexOf('}}', i + 2);
			const stop = end === -1 ? source.length : end + 2;
			current += source.slice(i, stop);
			i = stop;
			continue;
		}
		if (isWs(source[i])) {
			if (current) tokens.push(current);
			current = '';
			i++;
			continue;
		}
		current += source[i];
		i++;
	}
	if (current) tokens.push(current);
	return tokens;
}

function parseStyle(style: string): Decl[] {
	const parts: string[] = [];
	let current = '';
	let depth = 0;
	let quote: string | null = null;
	for (let i = 0; i < style.length; i++) {
		const c = style[i]!;
		if (quote) {
			current += c;
			if (c === quote) quote = null;
			continue;
		}
		if (style.startsWith('{{', i)) {
			const end = style.indexOf('}}', i + 2);
			const stop = end === -1 ? style.length : end + 2;
			current += style.slice(i, stop);
			i = stop - 1;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			current += c;
			continue;
		}
		if (c === '(') depth++;
		else if (c === ')') depth = Math.max(0, depth - 1);
		if (c === ';' && depth === 0) {
			parts.push(current);
			current = '';
			continue;
		}
		current += c;
	}
	parts.push(current);

	return parts
		.map((part) => part.trim())
		.filter(Boolean)
		.map((raw) => {
			const colon = raw.indexOf(':');
			if (colon === -1) return { name: '', value: '', raw };
			return { name: raw.slice(0, colon).trim(), value: raw.slice(colon + 1).trim(), raw };
		});
}

function attr(name: string, value: string): string {
	if (!value.includes('"')) return `${name}="${value}"`;
	if (!value.includes("'")) return `${name}='${value}'`;
	return `${name}="${value.replace(/"/g, '&quot;')}"`;
}

const php = (value: string): string => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/* -------------------------------------------------------------------------- */
/*  Pair conversion                                                            */
/* -------------------------------------------------------------------------- */

/** `dark:sm:bg:hover=green` / `bg/o=pink-500/80` / `m=4px` → canonical pair. */
function fromShorthand(key: string, value: string): Pair {
	if (key.endsWith('/o')) {
		const base = varName(key.slice(0, -2));
		const slash = lastTopLevelSlash(value);
		const color = slash === -1 ? value : value.slice(0, slash);
		const opacity = slash === -1 ? '' : value.slice(slash + 1);
		const vars: Array<[string, string]> = [[base, resolveColor(color)]];
		if (opacity) vars.push([`${base}-o`, PLAIN_NUMBER.test(opacity) ? `${opacity}%` : opacity]);
		return { cls: key, vars };
	}

	let cls = key;
	const segments = key.split(':');
	const index = propertyIndex(key);
	const segment = index === -1 ? undefined : segments[index];
	if (segment && !segment.startsWith('[') && SCALED.has(segment) && needsRaw(value)) {
		segments[index] = `[${segment}]`;
		cls = segments.join(':');
	}
	return { cls, vars: [[varName(cls), resolveColor(value)]] };
}

/** A plain class token whose `--var` is declared in `style`. */
function fromProper(token: string, vars: Map<string, string>): Pair | null {
	if (token.endsWith('/o')) {
		const color = varName(token.slice(0, -2));
		const opacity = `${color}-o`;
		const colorValue = vars.get(color);
		const opacityValue = vars.get(opacity);
		if (colorValue === undefined || opacityValue === undefined) return null;
		return {
			cls: token,
			vars: [
				[color, colorValue],
				[opacity, opacityValue]
			]
		};
	}
	const name = varName(token);
	const value = vars.get(name);
	return value === undefined ? null : { cls: token, vars: [[name, value]] };
}

/**
 * Canonical pair → `key` / `value` for the shorthand form.
 * Returns null when it can't be written faithfully as shorthand.
 */
function toShort(pair: Pair): { key: string; value: string } | null {
	if (pair.cls.endsWith('/o')) {
		if (pair.vars.length !== 2) return null;
		const color = pair.vars[0]![1];
		const opacity = /^(\d+(?:\.\d+)?)%$/.exec(pair.vars[1]![1]);
		if (!opacity || !color) return null;
		return { key: pair.cls, value: `${color}/${opacity[1]}` };
	}

	if (pair.vars.length !== 1) return null;
	const value = pair.vars[0]![1];
	if (!value) return null;

	let key = pair.cls;
	const segments = key.split(':');
	const index = propertyIndex(key);
	const segment = index === -1 ? undefined : segments[index];
	if (segment) {
		if (segment.startsWith('[') && segment.endsWith(']')) {
			const inner = segment.slice(1, -1);
			if (SCALED.has(inner) && needsRaw(value)) {
				segments[index] = inner;
				key = segments.join(':');
			}
		} else if (SCALED.has(segment) && needsRaw(value)) {
			// `m` + `--m: 4px` would become `[m]` once the runtime resolves `m=4px`.
			// That changes the meaning, so keep it in proper form.
			return null;
		}
	}

	const color = COLOR_VAR_RE.exec(value);
	return { key, value: color ? color[1]! : value };
}

/* -------------------------------------------------------------------------- */
/*  HTML scanning                                                              */
/* -------------------------------------------------------------------------- */

function readOpenTag(src: string, start: number): OpenTag | null {
	const nameRe = /<([A-Za-z][\w:.-]*)/y;
	nameRe.lastIndex = start;
	const match = nameRe.exec(src);
	if (!match) return null;

	const name = match[1]!;
	let i = start + match[0].length;
	const attrs: Attr[] = [];

	while (i < src.length) {
		while (isWs(src[i])) i++;
		if (i >= src.length) return null;

		if (src[i] === '>') {
			i++;
			return { name, attrs, raw: src.slice(start, i), end: i, selfClosing: false };
		}
		if (src[i] === '/' && src[i + 1] === '>') {
			i += 2;
			return { name, attrs, raw: src.slice(start, i), end: i, selfClosing: true };
		}

		const attrStart = i;
		let attrName: string;
		let value: string | null = null;

		if (src.startsWith('{{', i)) {
			const close = src.indexOf('}}', i + 2);
			if (close === -1) return null;
			i = close + 2;
			attrName = src.slice(attrStart, i);
		} else {
			while (
				i < src.length &&
				!isWs(src[i]) &&
				src[i] !== '=' &&
				src[i] !== '>' &&
				!(src[i] === '/' && src[i + 1] === '>')
			) {
				i++;
			}
			attrName = src.slice(attrStart, i);

			let j = i;
			while (isWs(src[j])) j++;
			if (src[j] === '=') {
				j++;
				while (isWs(src[j])) j++;
				const quote = src[j];
				if (quote === '"' || quote === "'") {
					const close = src.indexOf(quote, j + 1);
					if (close === -1) return null;
					value = src.slice(j + 1, close);
					i = close + 1;
				} else {
					const valueStart = j;
					while (j < src.length && !isWs(src[j]) && src[j] !== '>') j++;
					value = src.slice(valueStart, j);
					i = j;
				}
			}
		}

		if (i === attrStart) i++; // never stall on stray characters
		attrs.push({ name: attrName, value, raw: src.slice(attrStart, i) });
	}
	return null;
}

function classify(token: string, vars: Map<string, string>, used: Set<string>): Item {
	if (isArbitraryProp(token)) return { kind: 'static', token };

	const eq = token.indexOf('=');
	if (eq > 0) {
		const key = token.slice(0, eq);
		const value = token.slice(eq + 1);
		if (KEY_RE.test(key) && value) return { kind: 'pair', pair: fromShorthand(key, value) };
		return { kind: 'static', token };
	}

	const pair = fromProper(token, vars);
	if (pair) {
		for (const [name] of pair.vars) used.add(name);
		return { kind: 'pair', pair };
	}
	return { kind: 'static', token };
}

function analyze(tag: OpenTag, mode: RewriteMode): Analysis | null {
	const lower = tag.name.toLowerCase();
	const isXui = lower === 'x-ui';

	// Only plain lowercase HTML tags and <x-ui> are candidates. Components are left alone.
	if (!isXui && !/^[a-z][a-z0-9]*$/.test(tag.name)) return null;
	// `:u` is dynamic (conditionals), nothing static to rewrite.
	if (tag.attrs.some((a) => a.name === ':u')) return null;

	const get = (name: string): string | null =>
		tag.attrs.find((a) => a.name.toLowerCase() === name)?.value ?? null;

	let realTag = lower;
	if (isXui) {
		const as = get('as');
		realTag = 'div';
		if (as !== null) {
			if (!/^[a-z][a-z0-9]*$/i.test(as)) return null;
			realTag = as.toLowerCase();
		}
	}

	const decls = parseStyle(get('style') ?? '');
	const vars = new Map<string, string>();
	for (const decl of decls) if (decl.name.startsWith('--')) vars.set(decl.name, decl.value);

	const used = new Set<string>();
	const items: Item[] = [];
	for (const token of tokenize(get('class') ?? '')) items.push(classify(token, vars, used));
	if (isXui) {
		const noVars = new Map<string, string>();
		for (const token of tokenize(get('u') ?? '')) items.push(classify(token, noVars, new Set()));
	}

	const hasPairs = items.some((item) => item.kind === 'pair');
	const touched = mode === 'xui' ? hasPairs : hasPairs || isXui;
	if (!touched) return null;

	return {
		tag: realTag,
		items,
		leftover: decls.filter((decl) => !used.has(decl.name)),
		isXui,
		hasPairs
	};
}

function build(
	tag: OpenTag,
	a: Analysis,
	mode: RewriteMode
): { text: string; name: string; drop: boolean } {
	const classTokens: string[] = [];
	const styleDecls: string[] = a.leftover.map((decl) => decl.raw);
	const seenVars = new Set<string>();
	const u: Array<{ key: string; value: string }> = [];

	const asProper = (pair: Pair) => {
		classTokens.push(pair.cls);
		for (const [name, value] of pair.vars) {
			if (seenVars.has(name)) continue;
			seenVars.add(name);
			styleDecls.push(`${name}: ${value}`);
		}
	};

	for (const item of a.items) {
		if (item.kind === 'static') {
			classTokens.push(item.token);
			continue;
		}
		const short = toShort(item.pair);
		if (mode === 'proper' || !short) {
			asProper(item.pair);
		} else if (mode === 'shorthand') {
			if (hasWs(short.value)) asProper(item.pair);
			else classTokens.push(`${short.key}=${short.value}`);
		} else {
			u.push(short);
		}
	}

	const group: string[] = [];
	if (classTokens.length) group.push(attr('class', classTokens.join(' ')));
	if (u.length) {
		if (u.some((entry) => hasWs(entry.value))) {
			const entries = u.map((entry) => `'${php(entry.key)}' => '${php(entry.value)}'`);
			group.push(attr(':u', `[${entries.join(', ')}]`));
		} else {
			group.push(attr('u', u.map((entry) => `${entry.key}=${entry.value}`).join(' ')));
		}
	}
	if (styleDecls.length) group.push(attr('style', styleDecls.join('; ')));

	// Keep passthrough attributes where they were; the generated group takes the
	// slot of the first class/style/u/as attribute.
	const owned = new Set(['class', 'style']);
	if (a.isXui) {
		owned.add('u');
		owned.add('as');
	}
	const parts: string[] = [];
	if (mode === 'xui' && a.tag !== 'div') parts.push(attr('as', a.tag));
	let placed = false;
	for (const a2 of tag.attrs) {
		if (owned.has(a2.name.toLowerCase())) {
			if (!placed) {
				parts.push(...group);
				placed = true;
			}
			continue;
		}
		parts.push(a2.raw);
	}
	if (!placed) parts.push(...group);

	const name = mode === 'xui' ? 'x-ui' : a.tag;
	const selfOut = mode === 'xui' ? tag.selfClosing || VOID.has(a.tag) : tag.selfClosing;

	const newline = /\n([ \t]*)/.exec(tag.raw);
	const sep = newline ? `\n${newline[1]}` : ' ';

	const text = `<${name}${parts.length ? sep + parts.join(sep) : ''}${selfOut ? ' />' : '>'}`;
	return { text, name, drop: VOID.has(a.tag) };
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

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
			const closeRe = /<\/\s*([A-Za-z][\w:.-]*)\s*>/y;
			closeRe.lastIndex = lt;
			const match = closeRe.exec(input);
			if (!match) {
				out += '<';
				i = lt + 1;
				continue;
			}
			let name = match[1]!.toLowerCase();
			if (name === 'xui') name = 'x-ui'; // tolerate the `</xui>` typo
			let index = stack.length - 1;
			while (index >= 0 && stack[index]!.src !== name) index--;

			if (index === -1) {
				out += match[0];
			} else {
				const entry = stack[index]!;
				stack.length = index;
				if (entry.outName === null) out += match[0];
				else if (!entry.drop) out += `</${entry.outName}>`;
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
			if (analysis.hasPairs) rewritten++;
			const built = build(tag, analysis, mode);
			out += built.text;
			outName = built.name;
			drop = built.drop;
		} else {
			out += tag.raw;
		}
		i = tag.end;

		if (tag.selfClosing || VOID.has(lower)) continue;

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
		rewritten: proper.rewritten
	};
}