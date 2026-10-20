<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { COLORS, INTENSITIES } from '#lib/converter.js';
	import {
		COLOR_TOKENS,
		DEFAULTS,
		GROUPS,
		KNOWN_TOKENS,
		MULTIPLIER_TOKENS,
		STORAGE_KEY,
		type Layer,
		type PersistedThemeState,
		type Theme,
		type TokenValue
	} from '#lib/theme-config.js';

	interface Props {
		initialMode?: 'basic' | 'advanced';
	}

	let { initialMode = 'basic' }: Props = $props();

	type CssRule = { selector: string; declarations: Record<string, string> };

	function createUid(): string {
		return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
	}

	function slugify(input: string): string {
		return (
			input
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '') || 'custom'
		);
	}

	function makeTheme(name: string, group: string = 'theme'): Theme {
		return {
			id: createUid(),
			name,
			group,
			enabled: true,
			light: {},
			dark: {}
		};
	}

	function parseTopLevelRules(css: string): CssRule[] {
		const rules: CssRule[] = [];
		const src = css.replace(/\/\*[\s\S]*?\*\//g, '');

		function walk(content: string) {
			let j = 0;
			while (j < content.length) {
				while (j < content.length && /\s/.test(content[j])) j++;
				if (j >= content.length) break;

				const selStart = j;
				while (j < content.length && content[j] !== '{') j++;
				if (j >= content.length) break;

				const selector = content.slice(selStart, j).trim();
				let depth = 0;
				const bodyStart = j;
				do {
					if (content[j] === '{') depth++;
					else if (content[j] === '}') depth--;
					j++;
				} while (j < content.length && depth > 0);

				const body = content.slice(bodyStart + 1, j - 1);
				if (selector.startsWith('@')) {
					walk(body);
				} else if (selector) {
					const declarations: Record<string, string> = {};
					for (const stmt of body.split(';')) {
						const trimmed = stmt.trim();
						if (!trimmed) continue;
						const idx = trimmed.indexOf(':');
						if (idx === -1) continue;
						const prop = trimmed.slice(0, idx).trim();
						const value = trimmed.slice(idx + 1).trim();
						if (prop && value) {
							declarations[prop] = value;
						}
					}
					rules.push({ selector, declarations });
				}
			}
		}

		walk(src);
		return rules;
	}

	// Core state
	let builderMode = $state<'basic' | 'advanced'>('basic');
	let themes = $state<Theme[]>([makeTheme('custom', 'theme')]);
	let activeId = $state<string>('');
	let editMode = $state<Layer>('light');
	let customCss = $state<string>('');
	let advancedTab = $state<'tokens' | 'overrides' | 'css'>('tokens');
	let searchQuery = $state('');
	let showModifiedOnly = $state(false);
	let uiTheme = $state<'dark' | 'light'>('dark');

	// Split layout & drag state
	let sidebarWidth = $state(500);
	let isDraggingSplit = $state(false);
	let workspaceRef: HTMLElement | undefined = $state();

	// Popover state
	let openPopoverToken = $state<string | null>(null);
	let popoverCoords = $state<{ top: number; left: number }>({ top: 0, left: 0 });
	let popoverEl: HTMLDivElement | undefined = $state();

	// Feedback & iframe state
	let copyFeedback = $state(false);
	let resetFeedback = $state(false);
	let iframeEl: HTMLIFrameElement | undefined = $state();
	let iframeReady = $state(false);
	let initialized = false;

	onMount(() => {
		builderMode = initialMode;

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<PersistedThemeState>;
				if (initialMode === 'advanced') {
					builderMode = 'advanced';
				} else if (parsed.mode === 'basic' || parsed.mode === 'advanced') {
					builderMode = parsed.mode;
				}
				if (Array.isArray(parsed.themes) && parsed.themes.length > 0) {
					themes = parsed.themes.map((t) => ({
						id: t.id || createUid(),
						name: t.name || 'custom',
						group: t.group || 'theme',
						enabled: t.enabled !== false,
						light: t.light ?? {},
						dark: t.dark ?? {}
					}));
				}
				if (parsed.activeId && themes.some((t) => t.id === parsed.activeId)) {
					activeId = parsed.activeId;
				} else {
					activeId = themes[0].id;
				}
				if (parsed.editMode === 'light' || parsed.editMode === 'dark') {
					editMode = parsed.editMode;
				}
				if (typeof parsed.customCss === 'string') {
					customCss = parsed.customCss;
				}
			} else {
				activeId = themes[0].id;
			}
		} catch {
			activeId = themes[0].id;
		}

		if (!customCss.trim()) {
			customCss = buildSelectorStubs(themes);
		}

		initialized = true;

		const onMessage = (event: MessageEvent) => {
			if (event.data && event.data.type === 'IFRAME_READY') {
				iframeReady = true;
			}
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	});

	let activeTheme = $derived(themes.find((t) => t.id === activeId) ?? themes[0]);

	let activeOverrideCount = $derived(
		activeTheme ? Object.keys(activeTheme.light).length + Object.keys(activeTheme.dark).length : 0
	);

	let lightOverrideCount = $derived(activeTheme ? Object.keys(activeTheme.light).length : 0);
	let darkOverrideCount = $derived(activeTheme ? Object.keys(activeTheme.dark).length : 0);

	let groupedThemes = $derived.by(() => {
		const groups: Record<string, Theme[]> = {};
		for (const t of themes) {
			const g = t.group || 'theme';
			if (groups[g]) groups[g].push(t);
			else groups[g] = [t];
		}
		return Object.entries(groups);
	});

	function selectorFor(theme: Theme): string {
		if (builderMode === 'basic') {
			return '.z-theme-custom';
		}
		return `.z-${slugify(theme.group || 'theme')}-${slugify(theme.name || 'custom')}`;
	}

	function formatTokenValue(key: string, v: TokenValue): string {
		if (typeof v === 'number') {
			return key.endsWith('-o') ? `${v}%` : String(v);
		}
		return v;
	}

	function buildSelectorStubs(themeList: Theme[]): string {
		const stubs: string[] = [];
		for (const t of themeList) {
			const base = `.z-${slugify(t.group || 'theme')}-${slugify(t.name || 'custom')}`;
			stubs.push(`${base} {\n}`);
			stubs.push(`${base}.dark {\n}`);
		}
		return stubs.join('\n\n');
	}

	let customRules = $derived.by(() => parseTopLevelRules(customCss));

	let finalCss = $derived.by(() => {
		if (builderMode === 'basic') {
			const target = themes[0];
			if (!target) return '';
			const blocks: string[] = [];
			for (const [layerName, suffix] of [
				['light', ''],
				['dark', '.dark']
			] as const) {
				const entries = Object.entries(target[layerName]);
				if (entries.length > 0) {
					const lines = entries.map(([k, val]) => `\t\t--z-${k}: ${formatTokenValue(k, val)};`);
					blocks.push(`\t.z-theme-custom${suffix} {\n${lines.join('\n')}\n\t}`);
				}
			}
			if (blocks.length === 0) return '';
			return `@layer theme {\n${blocks.join('\n\n')}\n}`;
		}

		// Advanced mode: multi-theme + custom CSS overrides
		const rawBlocks: { selector: string; lines: string[] }[] = [];
		for (const t of themes) {
			const base = selectorFor(t);
			for (const [layerName, suffix] of [
				['light', ''],
				['dark', '.dark']
			] as const) {
				const selector = `${base}${suffix}`;
				const entries = Object.entries(t[layerName]);
				const lines = entries.map(([k, val]) => `\t\t--z-${k}: ${formatTokenValue(k, val)};`);

				for (const rule of customRules) {
					if (rule.selector !== selector) continue;
					for (const [prop, val] of Object.entries(rule.declarations)) {
						const tokenKey = prop.startsWith('--z-') ? prop.slice(4) : null;
						if (tokenKey && KNOWN_TOKENS.has(tokenKey)) continue;
						lines.push(`\t\t${prop}: ${val};`);
					}
				}

				if (lines.length > 0) {
					rawBlocks.push({ selector, lines });
				}
			}
		}

		if (rawBlocks.length === 0) return '';
		return `@layer theme {\n${rawBlocks
			.map((b) => `\t${b.selector} {\n${b.lines.join('\n')}\n\t}`)
			.join('\n\n')}\n}`;
	});

	let previewClass = $derived.by(() => {
		if (builderMode === 'basic') {
			return 'z-theme-custom';
		}
		return themes
			.filter((t) => t.enabled !== false)
			.map((t) => `z-${slugify(t.group || 'theme')}-${slugify(t.name || 'custom')}`)
			.join(' ');
	});

	let previewClassesWithMode = $derived(
		`${previewClass} ${editMode === 'dark' ? 'dark' : ''}`.trim()
	);

	// Filtered token groups for search / modified-only filter
	let filteredGroups = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		const layer = activeTheme ? activeTheme[editMode] : {};

		return GROUPS.map((group) => {
			const vars = group.vars.filter((v) => {
				if (showModifiedOnly && !(v in layer)) return false;
				if (q && !v.toLowerCase().includes(q) && !group.label.toLowerCase().includes(q)) {
					return false;
				}
				return true;
			});
			return { label: group.label, vars, totalCount: group.vars.length };
		}).filter((g) => g.vars.length > 0);
	});

	// Post live theme updates to /kitchen-sink iframe
	$effect(() => {
		const cssPayload = finalCss;
		const classPayload = previewClassesWithMode;
		if (iframeReady && iframeEl?.contentWindow) {
			iframeEl.contentWindow.postMessage(
				{
					type: 'THEME_UPDATE',
					css: cssPayload,
					classes: classPayload
				},
				'*'
			);
		}
	});

	// Persist state to localStorage
	$effect(() => {
		if (!initialized) return;
		const snapshot: PersistedThemeState = {
			mode: builderMode,
			themes,
			activeId,
			editMode,
			customCss
		};
		const timer = setTimeout(() => {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
			} catch {
				// Ignore storage errors
			}
		}, 250);

		return () => clearTimeout(timer);
	});

	// Close color palette popover on outside click or Escape
	$effect(() => {
		if (!openPopoverToken) return;

		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest('[data-color-popover]') || target?.closest('[data-color-swatch]')) {
				return;
			}
			openPopoverToken = null;
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				openPopoverToken = null;
			}
		};

		window.addEventListener('pointerdown', onPointerDown, true);
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown, true);
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	function setTokenValue(token: string, value: TokenValue) {
		if (!activeTheme) return;
		if (value === '' || value === undefined || value === null) {
			delete activeTheme[editMode][token];
			return;
		}
		activeTheme[editMode][token] = value;
	}

	function commitTextToken(token: string, raw: string) {
		if (!activeTheme) return;
		const val = raw.trim();
		if (!val) {
			delete activeTheme[editMode][token];
			return;
		}
		if (MULTIPLIER_TOKENS.has(token)) {
			const num = parseFloat(val);
			if (!Number.isNaN(num)) {
				activeTheme[editMode][token] = num;
			}
			return;
		}
		activeTheme[editMode][token] = val;
	}

	function resetToken(token: string) {
		if (!activeTheme) return;
		delete activeTheme[editMode][token];
	}

	function resetActiveTheme() {
		if (!activeTheme) return;
		activeTheme.light = {};
		activeTheme.dark = {};
		resetFeedback = true;
		setTimeout(() => {
			resetFeedback = false;
		}, 1600);
	}

	function editedInGroup(vars: string[]): number {
		if (!activeTheme) return 0;
		const layer = activeTheme[editMode];
		return vars.filter((v) => v in layer).length;
	}

	function selectThemeForPreview(themeId: string) {
		const target = themes.find((t) => t.id === themeId);
		if (!target) return;
		const group = target.group || 'theme';
		for (const t of themes) {
			if ((t.group || 'theme') === group) {
				t.enabled = t.id === themeId;
			}
		}
	}

	function enforceGroupSelection() {
		const groups: Record<string, Theme[]> = {};
		for (const t of themes) {
			const g = t.group || 'theme';
			if (groups[g]) groups[g].push(t);
			else groups[g] = [t];
		}
		for (const groupThemes of Object.values(groups)) {
			const enabledList = groupThemes.filter((t) => t.enabled !== false);
			if (enabledList.length > 1) {
				for (let i = 1; i < enabledList.length; i++) {
					enabledList[i].enabled = false;
				}
			} else if (enabledList.length === 0 && groupThemes.length > 0) {
				groupThemes[0].enabled = true;
			}
		}
	}

	function addTheme(groupName: string = 'theme') {
		const nextIndex = themes.length + 1;
		const created = makeTheme(`theme-${nextIndex}`, groupName);
		themes.push(created);
		activeId = created.id;
		selectThemeForPreview(created.id);
	}

	function removeTheme(id: string) {
		if (themes.length <= 1) return;
		const idx = themes.findIndex((t) => t.id === id);
		if (idx === -1) return;
		themes.splice(idx, 1);
		if (activeId === id) {
			activeId = themes[Math.max(0, idx - 1)].id;
		}
		enforceGroupSelection();
	}

	function addMissingSelectorStubs() {
		const existing = new Set(customRules.map((r) => r.selector));
		const expected: string[] = [];
		for (const t of themes) {
			const base = selectorFor(t);
			expected.push(base, `${base}.dark`);
		}
		const missing = expected.filter((s) => !existing.has(s));
		if (missing.length === 0) return;
		const stubs = missing.map((s) => `${s} {\n}`).join('\n\n');
		customCss = customCss.trim() ? `${customCss.trim()}\n\n${stubs}` : stubs;
	}

	function toggleColorPopover(token: string, event: MouseEvent) {
		event.stopPropagation();
		if (openPopoverToken === token) {
			openPopoverToken = null;
			return;
		}
		const btn = event.currentTarget as HTMLElement;
		const rect = btn.getBoundingClientRect();
		const popWidth = 680;
		const popHeight = 320;
		const left = Math.max(12, Math.min(rect.left, window.innerWidth - popWidth - 12));
		const top =
			rect.bottom + popHeight + 16 > window.innerHeight
				? Math.max(12, rect.top - popHeight - 8)
				: rect.bottom + 6;

		popoverCoords = { top, left };
		openPopoverToken = token;
	}

	function startSidebarResize(event: PointerEvent) {
		event.preventDefault();
		isDraggingSplit = true;

		const onPointerMove = (e: PointerEvent) => {
			if (!workspaceRef) return;
			const rect = workspaceRef.getBoundingClientRect();
			const nextWidth = e.clientX - rect.left;
			sidebarWidth = Math.min(720, Math.max(360, Math.round(nextWidth)));
		};

		const onPointerUp = () => {
			isDraggingSplit = false;
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
	}

	async function copyCss() {
		if (!finalCss) return;
		try {
			await navigator.clipboard.writeText(finalCss);
			copyFeedback = true;
			setTimeout(() => {
				copyFeedback = false;
			}, 1600);
		} catch {
			// Ignore clipboard failure
		}
	}

	function downloadCss() {
		if (!finalCss) return;
		const filename = builderMode === 'basic' ? 'z-theme-custom.css' : 'z-themes.css';
		const url = URL.createObjectURL(new Blob([finalCss], { type: 'text/css' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 500);
	}
</script>

<div class="playground-shell" class:theme-light={uiTheme === 'light'}>
	<!-- Unified Top Header Bar -->
	<header class="topbar">
		<div class="topbar-left">
			<a href={resolve('/(app)/theme-builder')} class="brand" aria-label="Theme Builder Home">
				<span class="brand-mark" aria-hidden="true">
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
						<path
							d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linejoin="round"
						/>
						<path
							d="M12 22V12M3 7l9 5 9-5"
							stroke="currentColor"
							stroke-width="2"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
				<span class="brand-name">0build</span>
				<span class="brand-badge">THEME BUILDER</span>
			</a>

			<!-- Basic vs Advanced Mode Switcher -->
			<div class="view-controls mode-switcher" role="group" aria-label="Theme Builder Mode">
				<button
					type="button"
					class="mode-switch-btn"
					class:active={builderMode === 'basic'}
					onclick={() => (builderMode = 'basic')}
				>
					Basic
				</button>
				<button
					type="button"
					class="mode-switch-btn"
					class:active={builderMode === 'advanced'}
					onclick={() => (builderMode = 'advanced')}
				>
					Advanced
				</button>
			</div>

			<div class="topbar-actions">
				<button
					type="button"
					class="action-btn"
					class:active-feedback={resetFeedback}
					onclick={resetActiveTheme}
					disabled={activeOverrideCount === 0}
					title="Reset active theme overrides"
				>
					<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
						<path
							d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6M3.5 14.5v-4h4"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span>{resetFeedback ? 'Reset!' : 'Reset'}</span>
				</button>

				<button
					type="button"
					class="action-btn"
					class:active-feedback={copyFeedback}
					onclick={copyCss}
					disabled={!finalCss}
					title="Copy generated @layer theme CSS"
				>
					<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
						<rect
							x="7"
							y="7"
							width="9"
							height="9"
							rx="1.5"
							stroke="currentColor"
							stroke-width="1.6"
						/>
						<path
							d="M4 13V5.5A1.5 1.5 0 0 1 5.5 4H13"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
						/>
					</svg>
					<span>{copyFeedback ? 'Copied!' : 'Copy CSS'}</span>
				</button>

				<button
					type="button"
					class="action-btn"
					onclick={downloadCss}
					disabled={!finalCss}
					title="Download generated CSS file"
				>
					<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
						<path
							d="M10 3v9.5m0 0l-3.5-3.5M10 12.5l3.5-3.5M4 15.5h12"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span>Download</span>
				</button>
			</div>
		</div>

		<div class="topbar-right">
			<a
				href={resolve('/(app)/playground')}
				class="nav-link-btn"
				title="Open Interactive Playground"
			>
				<span>Playground</span>
			</a>
			<a
				href={resolve('/(app)/convert')}
				class="nav-link-btn"
				title="Open Tailwind to 0build Converter"
			>
				<span>Convert</span>
			</a>

			<span class="control-divider" aria-hidden="true"></span>

			<!-- UI Theme Toggle -->
			<button
				type="button"
				class="icon-toggle"
				onclick={() => (uiTheme = uiTheme === 'dark' ? 'light' : 'dark')}
				title={uiTheme === 'dark' ? 'Switch UI to light theme' : 'Switch UI to dark theme'}
				aria-label="Toggle UI theme"
			>
				{#if uiTheme === 'dark'}
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75" />
						<path
							d="M12 3v2m0 14v2M3 12h2m14 0h2m-15.36-6.36l1.42 1.42m11.88 11.88l1.42 1.42m0-14.72l-1.42 1.42M6.06 17.94l-1.42 1.42"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<path
							d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linejoin="round"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</header>

	<!-- Main Theme Builder Workspace -->
	<main
		class="workspace layout-vertical"
		class:is-dragging={isDraggingSplit}
		bind:this={workspaceRef}
	>
		<!-- Left Sidebar: Token & Multi-Theme Controls -->
		<aside
			class="theme-sidebar"
			style="width: {sidebarWidth}px;"
			aria-label="Theme Token Configuration"
		>
			<!-- Top Configuration Header -->
			<div class="tb-controls-header">
				{#if builderMode === 'basic'}
					<div class="tb-single-summary">
						<code class="tb-selector-code">.z-theme-custom</code>
						<span class="meta-pill">{activeOverrideCount} overrides</span>
					</div>
				{:else}
					<!-- Advanced Multi-Theme Manager -->
					<div class="tb-groups-wrap">
						{#each groupedThemes as [groupName, groupThemes] (groupName)}
							<div class="tb-chip-group">
								<div class="tb-chip-group-header">
									<span class="tb-group-title">{groupName}</span>
									<button
										type="button"
										class="mini-tool-btn"
										onclick={() => addTheme(groupName)}
										title="Add theme to {groupName} group"
									>
										+ Add Theme
									</button>
								</div>
								<div class="tb-chips">
									{#each groupThemes as t (t.id)}
										<div class="tb-chip" class:active={t.id === activeId}>
											<input
												type="radio"
												name="preview-group-{slugify(groupName)}"
												class="tb-chip-radio"
												checked={t.enabled !== false}
												onchange={() => selectThemeForPreview(t.id)}
												title="Enable {selectorFor(t)} in preview"
											/>
											<button
												type="button"
												class="tb-chip-select"
												onclick={() => (activeId = t.id)}
											>
												{selectorFor(t)}
											</button>
											{#if themes.length > 1}
												<button
													type="button"
													class="tb-chip-delete"
													title="Delete {selectorFor(t)}"
													onclick={() => removeTheme(t.id)}
												>
													×
												</button>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>

					{#if activeTheme}
						<div class="tb-identity-row">
							<label class="tb-field">
								<span>Group</span>
								<input
									type="text"
									class="tb-input"
									bind:value={activeTheme.group}
									onblur={enforceGroupSelection}
									placeholder="theme"
									spellcheck="false"
								/>
							</label>
							<label class="tb-field">
								<span>Name</span>
								<input
									type="text"
									class="tb-input"
									bind:value={activeTheme.name}
									placeholder="custom"
									spellcheck="false"
								/>
							</label>
						</div>
					{/if}
				{/if}

				<!-- Light / Dark Layer Switcher -->
				<div class="tb-layer-seg" role="group" aria-label="Edit light or dark layer">
					<button
						type="button"
						class="tb-seg-btn"
						class:active={editMode === 'light'}
						onclick={() => (editMode = 'light')}
					>
						<span>Light</span>
						{#if lightOverrideCount > 0}
							<span class="tb-seg-count">{lightOverrideCount}</span>
						{/if}
					</button>
					<button
						type="button"
						class="tb-seg-btn"
						class:active={editMode === 'dark'}
						onclick={() => (editMode = 'dark')}
					>
						<span>Dark</span>
						{#if darkOverrideCount > 0}
							<span class="tb-seg-count">{darkOverrideCount}</span>
						{/if}
					</button>
				</div>

				{#if builderMode === 'advanced'}
					<div class="tb-subtabs">
						<button
							type="button"
							class="tb-subtab"
							class:active={advancedTab === 'tokens'}
							onclick={() => (advancedTab = 'tokens')}
						>
							Tokens
						</button>
						<button
							type="button"
							class="tb-subtab"
							class:active={advancedTab === 'overrides'}
							onclick={() => (advancedTab = 'overrides')}
						>
							Custom Overrides
						</button>
						<button
							type="button"
							class="tb-subtab"
							class:active={advancedTab === 'css'}
							onclick={() => (advancedTab = 'css')}
						>
							Generated CSS
						</button>
					</div>
				{/if}
			</div>

			{#if builderMode === 'basic' || advancedTab === 'tokens'}
				<!-- Token Search & Filter Bar -->
				<div class="tb-filter-bar">
					<input
						type="search"
						class="tb-input tb-search-input"
						placeholder="Filter --z-* tokens…"
						bind:value={searchQuery}
					/>
					<button
						type="button"
						class="mini-tool-btn"
						class:active={showModifiedOnly}
						onclick={() => (showModifiedOnly = !showModifiedOnly)}
						title="Show only modified tokens"
					>
						Modified
					</button>
				</div>

				<!-- Scrollable Token List -->
				<div class="tb-token-list">
					{#if filteredGroups.length === 0}
						<div class="tb-empty-tokens">No matching tokens found.</div>
					{:else}
						{#each filteredGroups as group (group.label)}
							<div class="tb-group-section">
								<div class="tb-group-header">
									<span>{group.label}</span>
									<span class="tb-group-counter">
										{editedInGroup(group.vars)}/{group.totalCount}
									</span>
								</div>

								{#each group.vars as v (v)}
									{@const layer = activeTheme ? activeTheme[editMode] : {}}
									{@const overridden = v in layer}
									{@const rawDefault =
										DEFAULTS[editMode]?.[v] ?? DEFAULTS.light?.[v] ?? DEFAULTS.dark?.[v]}
									{@const currentVal = layer[v] ?? rawDefault}
									{@const isColor = COLOR_TOKENS.has(v)}
									{@const placeholder = rawDefault !== undefined ? String(rawDefault) : ''}

									<div class="tb-token-row" class:overridden>
										<span class="tb-token-name" title="--z-{v}">--z-{v}</span>

										{#if v.endsWith('-o')}
											{@const pct =
												typeof currentVal === 'number'
													? currentVal
													: parseInt(String(currentVal), 10) || 0}
											<div class="tb-opacity-control">
												<input
													type="range"
													min="0"
													max="100"
													step="1"
													aria-label="--z-{v}"
													value={pct}
													oninput={(e) => setTokenValue(v, Number(e.currentTarget.value))}
												/>
												<span class="tb-pct-label">{pct}%</span>
											</div>
										{:else if isColor}
											<div class="tb-color-control">
												<button
													type="button"
													class="tb-swatch-btn"
													data-color-swatch
													aria-label="Pick palette color for --z-{v}"
													title="Pick from 0build color palette"
													onclick={(e) => toggleColorPopover(v, e)}
												>
													<span class="tb-swatch-fill" style="background: {String(currentVal)};"
													></span>
												</button>
												<input
													type="text"
													class="tb-input"
													spellcheck="false"
													autocomplete="off"
													{placeholder}
													value={overridden ? String(currentVal) : ''}
													oninput={(e) => commitTextToken(v, e.currentTarget.value)}
												/>
											</div>
										{:else if MULTIPLIER_TOKENS.has(v)}
											<input
												type="number"
												class="tb-input tb-number-input"
												step="0.05"
												min="0"
												value={typeof currentVal === 'number'
													? currentVal
													: parseFloat(String(currentVal)) || 0}
												oninput={(e) => {
													const num = parseFloat(e.currentTarget.value);
													if (!Number.isNaN(num)) {
														setTokenValue(v, num);
													}
												}}
											/>
										{:else}
											<input
												type="text"
												class="tb-input"
												spellcheck="false"
												autocomplete="off"
												{placeholder}
												value={overridden ? String(currentVal) : ''}
												oninput={(e) => commitTextToken(v, e.currentTarget.value)}
											/>
										{/if}

										<button
											type="button"
											class="tb-row-reset"
											class:visible={overridden}
											disabled={!overridden}
											title="Reset --z-{v} to default"
											aria-label="Reset --z-{v} to default"
											onclick={() => resetToken(v)}
										>
											↺
										</button>
									</div>
								{/each}
							</div>
						{/each}
					{/if}
				</div>
			{:else if advancedTab === 'overrides'}
				<div class="tb-overrides-pane">
					<div class="tb-overrides-toolbar">
						<span>Custom selector CSS declarations</span>
						<button type="button" class="mini-tool-btn" onclick={addMissingSelectorStubs}>
							+ Add Missing Selectors
						</button>
					</div>
					<textarea
						class="tb-code-textarea"
						bind:value={customCss}
						spellcheck="false"
						placeholder=".z-theme-custom &#123;\n  --custom-var: 1rem;\n&#125;"></textarea>
				</div>
			{:else}
				<div class="tb-overrides-pane">
					<div class="tb-overrides-toolbar">
						<span>Compiled @layer theme output</span>
						<button type="button" class="mini-tool-btn" onclick={copyCss} disabled={!finalCss}>
							{copyFeedback ? 'Copied!' : 'Copy'}
						</button>
					</div>
					<textarea
						class="tb-code-textarea"
						readonly
						value={finalCss || '/* Modify any token to generate @layer theme CSS */'}
						spellcheck="false"></textarea>
				</div>
			{/if}
		</aside>

		<!-- Draggable Split Resizer -->
		<div
			class="split-resizer vertical"
			class:active={isDraggingSplit}
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize sidebar and preview"
			onpointerdown={startSidebarResize}
			ondblclick={() => (sidebarWidth = 500)}
			title="Drag to resize sidebar (double-click to reset)"
		>
			<div class="split-grip"></div>
		</div>

		<!-- Right Stage: Kitchen Sink Preview Iframe -->
		<section class="preview-pane tb-stage-pane" aria-label="Theme Preview">
			<div class="editor-tabbar">
				<div class="tab-group">
					<div class="editor-tab active">
						<span>Preview (/kitchen-sink)</span>
					</div>
					<code class="meta-pill">{previewClassesWithMode}</code>
				</div>
			</div>

			<div class="full-preview-container">
				<iframe
					bind:this={iframeEl}
					src="/kitchen-sink"
					title="Theme preview"
					onload={() => (iframeReady = true)}
				></iframe>
				{#if isDraggingSplit}
					<div class="iframe-drag-shield"></div>
				{/if}
			</div>
		</section>
	</main>

	<!-- Floating 0build Color Palette Matrix Popover -->
	{#if openPopoverToken}
		<div
			class="tb-color-popover"
			data-color-popover
			bind:this={popoverEl}
			style="top: {popoverCoords.top}px; left: {popoverCoords.left}px;"
			role="dialog"
			aria-label="0build Color Palette"
		>
			<div class="tb-popover-header">
				<span>Select color for <code>--z-{openPopoverToken}</code></span>
				<button
					type="button"
					class="close-resp-btn"
					onclick={() => (openPopoverToken = null)}
					aria-label="Close color palette"
				>
					×
				</button>
			</div>
			<div class="tb-color-matrix" style="--columns: {COLORS.length};">
				<div class="tb-matrix-corner"></div>
				{#each COLORS as c (c)}
					<div class="tb-matrix-col-label">
						<span>{c}</span>
					</div>
				{/each}
				{#each INTENSITIES as i (i)}
					<div class="tb-matrix-row-label">{i}</div>
					{#each COLORS as c (c)}
						<button
							type="button"
							class="tb-palette-cell"
							style="background-color: var(--color-{c}-{i});"
							title="{c}-{i}"
							aria-label="{c}-{i}"
							onclick={() => {
								if (openPopoverToken) {
									setTokenValue(openPopoverToken, `var(--color-${c}-${i})`);
									openPopoverToken = null;
								}
							}}
						></button>
					{/each}
				{/each}
			</div>
		</div>
	{/if}
</div>
