<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import MonacoEditor from '#lib/components/MonacoEditor.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type SplitDirection = 'vertical' | 'horizontal';
	type ResizeHandle = 'left' | 'right' | 'bottom' | 'bottom-right';

	const STORAGE_KEY_CODE = 'playground:code:v1';
	const STORAGE_KEY_LAYOUT = 'playground:layout:v1';

	const DEFAULT_SPLIT = 50;
	const DEFAULT_RESP_WIDTH = 540;
	const DEFAULT_RESP_HEIGHT = 720;
	const MIN_RESP_WIDTH = 260;
	const MIN_RESP_HEIGHT = 200;

	const PRESETS = [
		{ label: 'Mobile', width: 375, height: 667 },
		{ label: 'SM', width: 640, height: 800 },
		{ label: 'MD', width: 768, height: 1024 },
		{ label: 'LG', width: 1024, height: 768 }
	] as const;

	// Core playground state
	let code = $state('');
	let previewCode = $state('');
	let splitDirection = $state<SplitDirection>('vertical');
	let previewOnly = $state(false);
	let responsiveMode = $state(false);
	let splitRatio = $state(DEFAULT_SPLIT);
	let respWidth = $state(DEFAULT_RESP_WIDTH);
	let respHeight = $state(DEFAULT_RESP_HEIGHT);
	let theme = $state<'dark' | 'light'>('dark');
	let wordWrap = $state<'on' | 'off'>('on');

	// Interaction / dragging state
	let isDraggingSplit = $state(false);
	let isDraggingResponsive = $state(false);
	let activeRespHandle = $state<ResizeHandle | null>(null);
	let copyFeedback = $state(false);
	let resetFeedback = $state(false);
	let formatFeedback = $state<'idle' | 'formatting' | 'formatted' | 'error'>('idle');
	let previewVersion = $state(0);

	// DOM refs
	let workspaceRef: HTMLElement | undefined = $state();
	let previewCanvasRef: HTMLDivElement | undefined = $state();

	let initialized = false;

	// Initialize from boilerplate or saved state on mount
	onMount(() => {
		const savedCode = localStorage.getItem(STORAGE_KEY_CODE);
		const initialCode = savedCode !== null ? savedCode : data.boilerplate;
		code = initialCode;
		previewCode = initialCode;

		try {
			const savedLayout = JSON.parse(localStorage.getItem(STORAGE_KEY_LAYOUT) || '{}');
			if (
				savedLayout.splitDirection === 'vertical' ||
				savedLayout.splitDirection === 'horizontal'
			) {
				splitDirection = savedLayout.splitDirection;
			}
			if (typeof savedLayout.previewOnly === 'boolean') {
				previewOnly = savedLayout.previewOnly;
			}
			if (typeof savedLayout.responsiveMode === 'boolean') {
				responsiveMode = savedLayout.responsiveMode;
			}
			if (typeof savedLayout.splitRatio === 'number') {
				splitRatio = Math.min(85, Math.max(15, savedLayout.splitRatio));
			}
			if (typeof savedLayout.respWidth === 'number') {
				respWidth = Math.max(MIN_RESP_WIDTH, savedLayout.respWidth);
			}
			if (typeof savedLayout.respHeight === 'number') {
				respHeight = Math.max(MIN_RESP_HEIGHT, savedLayout.respHeight);
			}
			if (savedLayout.theme === 'dark' || savedLayout.theme === 'light') {
				theme = savedLayout.theme;
			}
		} catch {
			// Ignore malformed storage
		}

		initialized = true;
	});

	// Debounce preview updates & persist code changes
	$effect(() => {
		const currentCode = code;
		if (!initialized) return;

		const timer = setTimeout(() => {
			previewCode = currentCode;
			try {
				localStorage.setItem(STORAGE_KEY_CODE, currentCode);
			} catch {
				// Ignore storage quota errors
			}
		}, 150);

		return () => clearTimeout(timer);
	});

	// Persist layout settings
	$effect(() => {
		if (!initialized) return;
		const layoutState = {
			splitDirection,
			previewOnly,
			responsiveMode,
			splitRatio,
			respWidth,
			respHeight,
			theme
		};
		try {
			localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(layoutState));
		} catch {
			// Ignore storage errors
		}
	});

	function setSplitMode(dir: SplitDirection) {
		splitDirection = dir;
		previewOnly = false;
	}

	function togglePreviewOnly() {
		previewOnly = !previewOnly;
	}

	function toggleResponsiveMode() {
		responsiveMode = !responsiveMode;
		if (responsiveMode && previewCanvasRef) {
			const rect = previewCanvasRef.getBoundingClientRect();
			const maxW = Math.max(MIN_RESP_WIDTH, Math.floor(rect.width - 64));
			const maxH = Math.max(MIN_RESP_HEIGHT, Math.floor(rect.height - 80));
			if (respWidth > maxW) respWidth = maxW;
			if (respHeight > maxH) respHeight = maxH;
		}
	}

	function resetAll() {
		code = data.boilerplate;
		previewCode = data.boilerplate;
		splitDirection = 'vertical';
		previewOnly = false;
		responsiveMode = false;
		splitRatio = DEFAULT_SPLIT;
		respWidth = DEFAULT_RESP_WIDTH;
		respHeight = DEFAULT_RESP_HEIGHT;
		previewVersion += 1;

		try {
			localStorage.removeItem(STORAGE_KEY_CODE);
			localStorage.removeItem(STORAGE_KEY_LAYOUT);
		} catch {
			// Ignore
		}

		resetFeedback = true;
		setTimeout(() => {
			resetFeedback = false;
		}, 1800);
	}

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copyFeedback = true;
			setTimeout(() => {
				copyFeedback = false;
			}, 1800);
		} catch {
			// Ignore clipboard failure
		}
	}

	async function formatCode() {
		if (formatFeedback === 'formatting') return;
		formatFeedback = 'formatting';

		try {
			const [prettier, htmlPlugin, postcssPlugin, babelPlugin, estreePlugin] = await Promise.all([
				import('prettier/standalone'),
				import('prettier/plugins/html'),
				import('prettier/plugins/postcss'),
				import('prettier/plugins/babel'),
				import('prettier/plugins/estree')
			]);

			const formatted = await prettier.format(code, {
				parser: 'html',
				plugins: [htmlPlugin, postcssPlugin, babelPlugin, estreePlugin],
				tabWidth: 2,
				useTabs: false,
				printWidth: 80
			});

			code = formatted;
			formatFeedback = 'formatted';
			setTimeout(() => {
				if (formatFeedback === 'formatted') formatFeedback = 'idle';
			}, 1800);
		} catch (err) {
			console.error('Prettier formatting error:', err);
			formatFeedback = 'error';
			setTimeout(() => {
				if (formatFeedback === 'error') formatFeedback = 'idle';
			}, 2200);
		}
	}

	// Split divider drag logic
	function startSplitDrag(event: PointerEvent) {
		event.preventDefault();
		isDraggingSplit = true;

		const onPointerMove = (e: PointerEvent) => {
			if (!workspaceRef) return;
			const rect = workspaceRef.getBoundingClientRect();
			if (splitDirection === 'vertical') {
				const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
				splitRatio = Math.min(85, Math.max(15, Math.round(rawPct * 10) / 10));
			} else {
				const rawPct = ((e.clientY - rect.top) / rect.height) * 100;
				splitRatio = Math.min(85, Math.max(15, Math.round(rawPct * 10) / 10));
			}
		};

		const onPointerUp = () => {
			isDraggingSplit = false;
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
	}

	// Responsive preview resize drag logic
	function startResponsiveDrag(handle: ResizeHandle, event: PointerEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDraggingResponsive = true;
		activeRespHandle = handle;

		const startX = event.clientX;
		const startY = event.clientY;
		const startW = respWidth;
		const startH = respHeight;

		const onPointerMove = (e: PointerEvent) => {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;

			const canvasRect = previewCanvasRef?.getBoundingClientRect();
			const maxW = canvasRect ? Math.max(MIN_RESP_WIDTH, Math.floor(canvasRect.width - 48)) : 3840;
			const maxH = canvasRect
				? Math.max(MIN_RESP_HEIGHT, Math.floor(canvasRect.height - 48))
				: 2160;

			if (handle === 'right' || handle === 'bottom-right') {
				// Because the preview box is centered horizontally, 2 * dx keeps the handle directly under the cursor
				respWidth = Math.min(maxW, Math.max(MIN_RESP_WIDTH, Math.round(startW + dx * 2)));
			} else if (handle === 'left') {
				respWidth = Math.min(maxW, Math.max(MIN_RESP_WIDTH, Math.round(startW - dx * 2)));
			}

			if (handle === 'bottom' || handle === 'bottom-right') {
				respHeight = Math.min(maxH, Math.max(MIN_RESP_HEIGHT, Math.round(startH + dy)));
			}
		};

		const onPointerUp = () => {
			isDraggingResponsive = false;
			activeRespHandle = null;
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
	}

	function applyPreset(w: number, h: number) {
		respWidth = w;
		respHeight = h;
	}

	function swapDimensions() {
		const prevW = respWidth;
		respWidth = respHeight;
		respHeight = prevW;
	}

	function handleWidthInput(e: Event) {
		const val = parseInt((e.currentTarget as HTMLInputElement).value, 10);
		if (!Number.isNaN(val)) {
			respWidth = Math.max(MIN_RESP_WIDTH, Math.min(3840, val));
		}
	}

	function handleHeightInput(e: Event) {
		const val = parseInt((e.currentTarget as HTMLInputElement).value, 10);
		if (!Number.isNaN(val)) {
			respHeight = Math.max(MIN_RESP_HEIGHT, Math.min(2160, val));
		}
	}
</script>

<svelte:head>
	<title>Playground — 0build</title>
</svelte:head>

<div class="playground-shell" class:theme-light={theme === 'light'}>
	<!-- Top Header Bar (Tailwind Play style) -->
	<header class="topbar">
		<div class="topbar-left">
			<a href={resolve('/(app)/playground')} class="brand" aria-label="Playground Home">
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
				<span class="brand-badge">PLAY</span>
			</a>

			<div class="topbar-actions">
				<button
					type="button"
					class="action-btn"
					class:active-feedback={formatFeedback === 'formatted'}
					class:error-feedback={formatFeedback === 'error'}
					onclick={formatCode}
					disabled={formatFeedback === 'formatting'}
					title="Format document with Prettier"
				>
					<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
						<path
							d="M4 5h8M4 8.5h5M11 8.5h5M4 12h7M13 12h3M4 15.5h6"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
						/>
					</svg>
					<span>
						{#if formatFeedback === 'formatting'}
							Formatting…
						{:else if formatFeedback === 'formatted'}
							Formatted!
						{:else if formatFeedback === 'error'}
							Syntax Error
						{:else}
							Prettier
						{/if}
					</span>
				</button>

				<button
					type="button"
					class="action-btn reset-btn"
					class:active-feedback={resetFeedback}
					onclick={resetAll}
					title="Reset everything back to default boilerplate"
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
					onclick={copyCode}
					title="Copy full HTML document to clipboard"
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
					<span>{copyFeedback ? 'Copied!' : 'Copy HTML'}</span>
				</button>
			</div>
		</div>

		<div class="topbar-right">
			<a
				href={resolve('/(app)/convert')}
				class="action-btn nav-link"
				title="Open Tailwind to 0build Converter"
			>
				<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
					<path
						d="M4 7h12m-3-3l3 3-3 3M16 13H4m3-3l-3 3 3 3"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>Convert</span>
			</a>

			<a
				href={resolve('/(app)/theme-builder')}
				class="action-btn nav-link"
				title="Open Theme Builder"
			>
				<span>Theme Builder</span>
			</a>

			<span class="control-divider" aria-hidden="true"></span>

			<!-- Layout & View Mode Controls (Matches Tailwind Play) -->
			<div class="view-controls" role="group" aria-label="Layout and preview controls">
				<!-- Vertical Split: Code Left / Preview Right -->
				<button
					type="button"
					class="icon-toggle"
					class:active={!previewOnly && splitDirection === 'vertical'}
					onclick={() => setSplitMode('vertical')}
					title="Split vertical (Code left, Preview right)"
					aria-label="Split vertical"
					aria-pressed={!previewOnly && splitDirection === 'vertical'}
				>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<rect
							x="3"
							y="4"
							width="18"
							height="16"
							rx="2"
							stroke="currentColor"
							stroke-width="1.75"
						/>
						<path d="M12 4v16" stroke="currentColor" stroke-width="1.75" />
					</svg>
				</button>

				<!-- Horizontal Split: Code Top / Preview Bottom -->
				<button
					type="button"
					class="icon-toggle"
					class:active={!previewOnly && splitDirection === 'horizontal'}
					onclick={() => setSplitMode('horizontal')}
					title="Split horizontal (Code top, Preview bottom)"
					aria-label="Split horizontal"
					aria-pressed={!previewOnly && splitDirection === 'horizontal'}
				>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<rect
							x="3"
							y="4"
							width="18"
							height="16"
							rx="2"
							stroke="currentColor"
							stroke-width="1.75"
						/>
						<path d="M3 12h18" stroke="currentColor" stroke-width="1.75" />
					</svg>
				</button>

				<!-- Dedicated Preview Toggle (Full Preview View) -->
				<button
					type="button"
					class="icon-toggle"
					class:active={previewOnly}
					onclick={togglePreviewOnly}
					title="Toggle dedicated preview mode"
					aria-label="Toggle dedicated preview mode"
					aria-pressed={previewOnly}
				>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<rect
							x="3"
							y="4"
							width="18"
							height="16"
							rx="2"
							stroke="currentColor"
							stroke-width="1.75"
						/>
						<path
							d="M9.5 9.5L7 12l2.5 2.5M14.5 9.5L17 12l-2.5 2.5"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				<span class="control-divider" aria-hidden="true"></span>

				<!-- Responsive Mode Toggle -->
				<button
					type="button"
					class="icon-toggle"
					class:active={responsiveMode}
					onclick={toggleResponsiveMode}
					title="Toggle responsive design mode"
					aria-label="Toggle responsive design mode"
					aria-pressed={responsiveMode}
				>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
						<rect
							x="3"
							y="4"
							width="13"
							height="12"
							rx="1.75"
							stroke="currentColor"
							stroke-width="1.75"
						/>
						<rect
							x="14"
							y="9"
							width="7"
							height="11"
							rx="1.5"
							fill="var(--play-header-bg)"
							stroke="currentColor"
							stroke-width="1.75"
						/>
					</svg>
				</button>
			</div>

			<span class="control-divider" aria-hidden="true"></span>

			<!-- Playground UI Theme Toggle -->
			<button
				type="button"
				class="icon-toggle"
				onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
				title={theme === 'dark'
					? 'Switch playground to light theme'
					: 'Switch playground to dark theme'}
				aria-label="Toggle editor theme"
			>
				{#if theme === 'dark'}
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

	<!-- Main Split Workspace -->
	<main
		class="workspace"
		class:layout-vertical={splitDirection === 'vertical'}
		class:layout-horizontal={splitDirection === 'horizontal'}
		class:preview-only={previewOnly}
		class:is-dragging={isDraggingSplit || isDraggingResponsive}
		bind:this={workspaceRef}
	>
		<!-- Code Editor Pane -->
		<section
			class="editor-pane"
			aria-label="HTML Document Editor"
			hidden={previewOnly}
			style={previewOnly
				? 'display: none;'
				: splitDirection === 'vertical'
					? `width: ${splitRatio}%; height: 100%;`
					: `width: 100%; height: ${splitRatio}%;`}
		>
			<div class="editor-tabbar">
				<div class="tab-group">
					<div class="editor-tab active">
						<svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
							<path
								d="M2.5 2h11l-1 10.5L8 14l-4.5-1.5L2.5 2z"
								stroke="#38bdf8"
								stroke-width="1.4"
								stroke-linejoin="round"
							/>
						</svg>
						<span>index.html</span>
					</div>
					<span class="doc-ownership-pill">Full Document</span>
				</div>

				<div class="editor-tools">
					<button
						type="button"
						class="mini-tool-btn"
						class:active={wordWrap === 'on'}
						onclick={() => (wordWrap = wordWrap === 'on' ? 'off' : 'on')}
						title="Toggle Word Wrap"
					>
						Wrap: {wordWrap === 'on' ? 'On' : 'Off'}
					</button>
				</div>
			</div>

			<div class="editor-body">
				<MonacoEditor bind:value={code} language="html" {theme} {wordWrap} />
			</div>
		</section>

		<!-- Draggable Split Divider -->
		{#if !previewOnly}
			<div
				class="split-resizer"
				class:vertical={splitDirection === 'vertical'}
				class:horizontal={splitDirection === 'horizontal'}
				class:active={isDraggingSplit}
				role="separator"
				aria-orientation={splitDirection === 'vertical' ? 'vertical' : 'horizontal'}
				aria-label="Resize code and preview panes"
				onpointerdown={startSplitDrag}
				ondblclick={() => (splitRatio = DEFAULT_SPLIT)}
				title="Drag to resize panes (double-click to reset)"
			>
				<div class="split-grip"></div>
			</div>
		{/if}

		<!-- Preview Pane -->
		<section
			class="preview-pane"
			class:responsive-enabled={responsiveMode}
			aria-label="Live Document Preview"
			style={previewOnly
				? 'width: 100%; height: 100%;'
				: splitDirection === 'vertical'
					? `width: ${100 - splitRatio}%; height: 100%;`
					: `width: 100%; height: ${100 - splitRatio}%;`}
		>
			{#if responsiveMode}
				<!-- Responsive Mode Header Toolbar -->
				<div class="responsive-toolbar">
					<div class="preset-list">
						{#each PRESETS as preset (preset.label)}
							<button
								type="button"
								class="preset-btn"
								class:active={respWidth === preset.width && respHeight === preset.height}
								onclick={() => applyPreset(preset.width, preset.height)}
							>
								<span>{preset.label}</span>
								<small>{preset.width}</small>
							</button>
						{/each}
					</div>

					<div class="dimension-controls">
						<label class="dim-input-wrap" aria-label="Viewport width in pixels">
							<input
								type="number"
								min={MIN_RESP_WIDTH}
								max="3840"
								value={respWidth}
								onchange={handleWidthInput}
							/>
						</label>
						<span class="dim-times">×</span>
						<label class="dim-input-wrap" aria-label="Viewport height in pixels">
							<input
								type="number"
								min={MIN_RESP_HEIGHT}
								max="2160"
								value={respHeight}
								onchange={handleHeightInput}
							/>
						</label>
						<span class="dim-unit">px</span>

						<button
							type="button"
							class="dim-icon-btn"
							onclick={swapDimensions}
							title="Rotate / Swap width and height"
							aria-label="Swap width and height"
						>
							<svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
								<path
									d="M3 5h10M10 2l3 3-3 3M13 11H3m3-3l-3 3 3 3"
									stroke="currentColor"
									stroke-width="1.4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					</div>

					<button
						type="button"
						class="close-resp-btn"
						onclick={() => (responsiveMode = false)}
						title="Exit responsive mode"
						aria-label="Exit responsive mode"
					>
						<svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
							<path
								d="M4 4l8 8m0-8l-8 8"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				</div>

				<!-- Responsive Resizable Viewport Canvas -->
				<div class="responsive-canvas" bind:this={previewCanvasRef}>
					<div class="responsive-stage" style="width: {respWidth}px; height: {respHeight}px;">
						<div class="iframe-frame">
							{#key previewVersion}
								<iframe
									title="Playground Live Preview"
									srcdoc={previewCode}
									sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
								></iframe>
							{/key}
							{#if isDraggingSplit || isDraggingResponsive}
								<div class="iframe-drag-shield"></div>
							{/if}
							{#if isDraggingResponsive}
								<div class="live-size-badge">
									{respWidth} × {respHeight}
								</div>
							{/if}
						</div>

						<!-- Left Resize Handle -->
						<div
							class="resp-handle resp-handle-left"
							class:active={activeRespHandle === 'left'}
							role="presentation"
							onpointerdown={(e) => startResponsiveDrag('left', e)}
							title="Drag to resize width"
						>
							<span class="handle-bar-v"></span>
						</div>

						<!-- Right Resize Handle -->
						<div
							class="resp-handle resp-handle-right"
							class:active={activeRespHandle === 'right'}
							role="presentation"
							onpointerdown={(e) => startResponsiveDrag('right', e)}
							title="Drag to resize width"
						>
							<span class="handle-bar-v"></span>
						</div>

						<!-- Bottom Resize Handle -->
						<div
							class="resp-handle resp-handle-bottom"
							class:active={activeRespHandle === 'bottom'}
							role="presentation"
							onpointerdown={(e) => startResponsiveDrag('bottom', e)}
							title="Drag to resize height"
						>
							<span class="handle-bar-h"></span>
						</div>

						<!-- Bottom-Right Corner Resize Handle -->
						<div
							class="resp-handle resp-handle-corner"
							class:active={activeRespHandle === 'bottom-right'}
							role="presentation"
							onpointerdown={(e) => startResponsiveDrag('bottom-right', e)}
							title="Drag to resize width and height"
						>
							<svg viewBox="0 0 12 12" width="11" height="11" fill="none" aria-hidden="true">
								<path
									d="M10 2L2 10M10 6L6 10"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
								/>
							</svg>
						</div>
					</div>
				</div>
			{:else}
				<!-- Standard Full-Bleed Preview -->
				<div class="full-preview-container" bind:this={previewCanvasRef}>
					{#key previewVersion}
						<iframe
							title="Playground Live Preview"
							srcdoc={previewCode}
							sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
						></iframe>
					{/key}
					{#if isDraggingSplit}
						<div class="iframe-drag-shield"></div>
					{/if}
				</div>
			{/if}
		</section>
	</main>
</div>
