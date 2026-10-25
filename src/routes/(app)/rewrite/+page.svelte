<script lang="ts">
	import MonacoEditor from '#lib/components/MonacoEditor.svelte';
	import { rewriteAll } from '#lib/rewriter.js';
	import { resolve } from '$app/paths';

	const DEFAULT_SAMPLE = `<div class="display-flex p=4 dark:sm:bg:hover=green">
  <h2 class="color" style="--color: var(--color-pink-500)">Proper in</h2>
  <p class="[m]" style="--m: 4px">Raw value on a scaled utility</p>
  <button class="bg/o=var(--color-blue-800)/80" type="button">Opacity</button>
  <x-ui as="a" class="z-link" href="/docs" u="mt=1.5 bg=pink-500">x-ui in</x-ui>
  <span class="z-badge">No pairs, left as is</span>
</div>`;

	const PANES = [
		{ key: 'proper', title: 'Proper', hint: 'class + style' },
		{ key: 'xui', title: 'x-ui', hint: 'Laravel component' },
		{ key: 'shorthand', title: 'Shorthand', hint: 'class="p=4"' }
	] as const;

	type PaneKey = (typeof PANES)[number]['key'];

	let inputCode = $state(DEFAULT_SAMPLE);
	let theme = $state<'dark' | 'light'>('dark');
	let wordWrap = $state<'on' | 'off'>('on');
	let copiedPane = $state<PaneKey | null>(null);
	let resetFeedback = $state(false);

	let result = $derived(rewriteAll(inputCode));

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

	async function copyPane(key: PaneKey) {
		try {
			await navigator.clipboard.writeText(result[key]);
			copiedPane = key;
			setTimeout(() => {
				if (copiedPane === key) {
					copiedPane = null;
				}
			}, 1800);
		} catch {
			// Ignore clipboard errors
		}
	}
</script>

<svelte:head>
	<title>Rewrite 0build — 0build</title>
</svelte:head>

<div class="playground-shell" class:theme-light={theme === 'light'}>
	<!-- Top Header Bar (matches /convert and /playground) -->
	<header class="topbar">
		<div class="topbar-left">
			<a href={resolve('/(app)/rewrite')} class="brand" aria-label="Rewriter Home">
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
				<span class="brand-badge">REWRITE</span>
			</a>

			<div class="topbar-actions">
				<button
					type="button"
					class="action-btn"
					class:active-feedback={resetFeedback}
					onclick={resetSample}
					title="Reset to sample snippet"
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
			<a href={resolve('/(app)/theme-builder')} class="nav-link-btn" title="Open Theme Builder">
				<span>Theme Builder</span>
			</a>
			<a href={resolve('/(app)/convert')} class="nav-link-btn" title="Convert Tailwind to 0build">
				<span>Convert</span>
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

	<!-- Info Banner -->
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
			Paste HTML that uses 0build in any form: proper (<code>class</code> + <code>--var</code>),
			shorthand (<code>p=4</code>), or <code>&lt;x-ui&gt;</code> with <code>u</code>. Only elements
			that carry a pair are rewritten; everything else is copied as is.
		</p>
	</div>

	<!-- Main 50-50 Vertical Split Workspace -->
	<main class="convert-workspace">
		<!-- Left Side (50%): Input -->
		<section class="pane input-pane" aria-label="0build Input">
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
						<span>Input</span>
					</div>
					<span class="meta-pill" class:success={result.rewritten > 0}>
						{result.rewritten} to rewrite
					</span>
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

		<!-- Right Side (50%): three stacked outputs -->
		<div class="right-column">
			{#each PANES as pane, index (pane.key)}
				{#if index > 0}
					<div class="horizontal-divider" aria-hidden="true"></div>
				{/if}

				<section class="pane output-pane" aria-label="{pane.title} output">
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
								<span>{pane.title}</span>
							</div>
							<span class="meta-pill">{pane.hint}</span>
						</div>

						<div class="editor-tools">
							<button
								type="button"
								class="mini-tool-btn"
								class:active={copiedPane === pane.key}
								onclick={() => copyPane(pane.key)}
							>
								{copiedPane === pane.key ? 'Copied!' : 'Copy'}
							</button>
						</div>
					</div>

					<div class="editor-body">
						<MonacoEditor
							value={result[pane.key]}
							language="html"
							{theme}
							{wordWrap}
							readOnly={true}
						/>
					</div>
				</section>
			{/each}
		</div>
	</main>
</div>
