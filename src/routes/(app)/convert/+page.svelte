<script lang="ts">
	import { resolve } from '$app/paths';
	import MonacoEditor from '#lib/components/MonacoEditor.svelte';
	import { convertTailwindTo0build } from '#lib/converter.js';

	const DEFAULT_SAMPLE = `<div class="flex items-center justify-between p-4 m-1 m-[1px] bg-slate-900 dark:bg-slate-800 rounded-xl shadow-lg">
  <h2 class="block text-xl font-bold text-pink-500 dark:sm:text-pink-400 after:text-pink-500">
    0build Converter
  </h2>
  <button class="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 focus-visible:ring-2 text-white max-sm:hidden rounded-lg transition-colors">
    Convert Now
  </button>
</div>`;

	let inputCode = $state(DEFAULT_SAMPLE);
	let theme = $state<'dark' | 'light'>('dark');
	let wordWrap = $state<'on' | 'off'>('on');
	let copyFeedback = $state(false);
	let resetFeedback = $state(false);

	let result = $derived(convertTailwindTo0build(inputCode));
	let outputCode = $derived(result.output);

	function resetSample() {
		inputCode = DEFAULT_SAMPLE;
		resetFeedback = true;
		setTimeout(() => {
			resetFeedback = false;
		}, 1800);
	}

	function clearInput() {
		inputCode = '';
	}

	async function copyOutput() {
		try {
			await navigator.clipboard.writeText(outputCode);
			copyFeedback = true;
			setTimeout(() => {
				copyFeedback = false;
			}, 1800);
		} catch {
			// Ignore clipboard errors
		}
	}
</script>

<svelte:head>
	<title>Convert Tailwind to 0build — 0build</title>
</svelte:head>

<div class="playground-shell" class:theme-light={theme === 'light'}>
	<!-- Top Header Bar (Matches /playground for visual consistency) -->
	<header class="topbar">
		<div class="topbar-left">
			<a href={resolve('/(app)/convert')} class="brand" aria-label="Converter Home">
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
				<span class="brand-badge">CONVERT</span>
			</a>

			<div class="topbar-actions">
				<button
					type="button"
					class="action-btn"
					class:active-feedback={resetFeedback}
					onclick={resetSample}
					title="Reset to sample Tailwind snippet"
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
					<span>{resetFeedback ? 'Reset!' : 'Reset Sample'}</span>
				</button>

				<button type="button" class="action-btn" onclick={clearInput} title="Clear input editor">
					<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
						<path
							d="M5 5l10 10M15 5L5 15"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
						/>
					</svg>
					<span>Clear</span>
				</button>

				<button
					type="button"
					class="action-btn"
					class:active-feedback={copyFeedback}
					onclick={copyOutput}
					title="Copy converted 0build output to clipboard"
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
					<span>{copyFeedback ? 'Copied!' : 'Copy Output'}</span>
				</button>
			</div>
		</div>

		<div class="topbar-right">
			<a
				href={resolve('/(app)/playground')}
				class="nav-link-btn"
				title="Open Interactive Playground"
			>
				<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
					<path
						d="M6.5 6L3 10l3.5 4M13.5 6L17 10l-3.5 4M11 4l-2 12"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>Playground</span>
			</a>

			<a href={resolve('/(app)/theme-builder')} class="nav-link-btn" title="Open Theme Builder">
				<span>Theme Builder</span>
			</a>

			<span class="control-divider" aria-hidden="true"></span>

			<!-- Theme Toggle -->
			<button
				type="button"
				class="icon-toggle"
				onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
				title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
				aria-label="Toggle theme"
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

	<!-- Disclaimer Banner -->
	<div class="disclaimer-banner" role="note">
		<svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
			<circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.6" />
			<path
				d="M10 6.5v4M10 13.5h.01"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
			/>
		</svg>
		<p>
			<strong>Disclaimer:</strong> Not everything in Tailwind CSS is supported. This tool only
			converts basic Tailwind utility patterns, standard breakpoints (<code>sm</code>–<code
				>2xl</code
			>, no
			<code>max-*</code>), supported interactive states, <code>::before</code> /
			<code>::after</code>, and the 0build color palette (<code>50</code>–<code>950</code>).
			Unsupported tokens are left as-is and listed in the <strong>Reports</strong> panel.
		</p>
	</div>

	<!-- Main 50-50 Vertical Split Workspace -->
	<main class="convert-workspace">
		<!-- Left Side (50%): Input -->
		<section class="pane input-pane" aria-label="Tailwind CSS Input">
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
						<span>Input (Tailwind CSS)</span>
					</div>
					<span class="meta-pill">{result.totalTokens} tokens</span>
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
				<MonacoEditor bind:value={inputCode} language="html" {theme} {wordWrap} />
			</div>
		</section>

		<!-- Fixed 50-50 Vertical Divider -->
		<div class="vertical-divider" aria-hidden="true"></div>

		<!-- Right Side (50%): Split Horizontally (Top = Output, Bottom = Reports) -->
		<div class="right-column">
			<!-- Top Half: Output -->
			<section class="pane output-pane" aria-label="0build Converted Output">
				<div class="editor-tabbar">
					<div class="tab-group">
						<div class="editor-tab active">
							<svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
								<path
									d="M3 8.5l3.2 3.2L13 5"
									stroke="#38bdf8"
									stroke-width="1.6"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							<span>Output (0build)</span>
						</div>
						<span class="meta-pill success">
							{result.convertedCount} / {result.totalTokens} converted
						</span>
					</div>

					<div class="editor-tools">
						<button
							type="button"
							class="mini-tool-btn"
							class:active={copyFeedback}
							onclick={copyOutput}
						>
							{copyFeedback ? 'Copied!' : 'Copy'}
						</button>
					</div>
				</div>

				<div class="editor-body">
					<MonacoEditor value={outputCode} language="html" {theme} {wordWrap} readOnly={true} />
				</div>
			</section>

			<!-- Horizontal Divider -->
			<div class="horizontal-divider" aria-hidden="true"></div>

			<!-- Bottom Half: Reports (Unconverted Tokens) -->
			<section class="pane reports-pane" aria-label="Unconverted Token Reports">
				<div class="editor-tabbar">
					<div class="tab-group">
						<div class="editor-tab active reports-tab">
							<svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
								<path
									d="M8 2.5L1.8 13.5h12.4L8 2.5z"
									stroke="currentColor"
									stroke-width="1.4"
									stroke-linejoin="round"
								/>
								<path
									d="M8 6.5v3M8 11.5h.01"
									stroke="currentColor"
									stroke-width="1.4"
									stroke-linecap="round"
								/>
							</svg>
							<span>Reports</span>
						</div>
						<span
							class="meta-pill"
							class:warning={result.reports.length > 0}
							class:success={result.reports.length === 0}
						>
							{result.reports.length} unconverted
						</span>
					</div>
				</div>

				<div class="reports-body">
					{#if result.reports.length === 0}
						<div class="reports-empty">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
								<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
								<path
									d="M8.5 12.5l2.3 2.3 4.7-4.8"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							<span>All tokens converted cleanly to 0build utilities.</span>
						</div>
					{:else}
						<ul class="report-list">
							{#each result.reports as item (item.token)}
								<li class="report-item">
									<div class="report-token-row">
										<code class="report-token">{item.token}</code>
										{#if item.count > 1}
											<span class="report-count">×{item.count}</span>
										{/if}
									</div>
									<p class="report-reason">{item.reason}</p>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</section>
		</div>
	</main>
</div>
