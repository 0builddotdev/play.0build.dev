<script lang="ts">
	import { onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor';

	interface Props {
		value: string;
		language?: string;
		theme?: 'dark' | 'light';
		wordWrap?: 'on' | 'off';
		readOnly?: boolean;
		onChange?: (newValue: string) => void;
	}

	let {
		value = $bindable(''),
		language = 'html',
		theme = 'dark',
		wordWrap = 'on',
		readOnly = false,
		onChange
	}: Props = $props();

	let containerRef: HTMLDivElement | undefined = $state();
	let editor: Monaco.editor.IStandaloneCodeEditor | undefined = $state();
	let monacoInstance: typeof Monaco | undefined = $state();
	let isUpdatingFromEditor = false;

	onMount(() => {
		let resizeObserver: ResizeObserver | undefined;
		let disposed = false;

		(async () => {
			const [
				monaco,
				{ default: editorWorker },
				{ default: jsonWorker },
				{ default: cssWorker },
				{ default: htmlWorker },
				{ default: tsWorker }
			] = await Promise.all([
				import('monaco-editor'),
				import('monaco-editor/editor/editor.worker?worker'),
				import('monaco-editor/language/json/json.worker?worker'),
				import('monaco-editor/language/css/css.worker?worker'),
				import('monaco-editor/language/html/html.worker?worker'),
				import('monaco-editor/language/typescript/ts.worker?worker')
			]);

			if (disposed || !containerRef) {
				return;
			}

			self.MonacoEnvironment = {
				getWorker(_: unknown, label: string) {
					if (label === 'json') {
						return new jsonWorker();
					}
					if (label === 'css' || label === 'scss' || label === 'less') {
						return new cssWorker();
					}
					if (label === 'html' || label === 'handlebars' || label === 'razor') {
						return new htmlWorker();
					}
					if (label === 'typescript' || label === 'javascript') {
						return new tsWorker();
					}
					return new editorWorker();
				}
			};

			monaco.editor.defineTheme('play-dark', {
				base: 'vs-dark',
				inherit: true,
				rules: [
					{ token: 'comment', foreground: '64748b', fontStyle: 'italic' },
					{ token: 'tag', foreground: 'f472b6' },
					{ token: 'attribute.name', foreground: 'cbd5e1' },
					{ token: 'attribute.value', foreground: '38bdf8' },
					{ token: 'delimiter.html', foreground: '64748b' },
					{ token: 'string', foreground: '38bdf8' },
					{ token: 'keyword', foreground: 'c084fc' }
				],
				colors: {
					'editor.background': '#0f172a',
					'editor.foreground': '#f8fafc',
					'editor.lineHighlightBackground': '#1e293b80',
					'editorLineNumber.foreground': '#475569',
					'editorLineNumber.activeForeground': '#94a3b8',
					'editor.selectionBackground': '#38bdf833',
					'editorIndentGuide.background1': '#1e293b',
					'editorIndentGuide.activeBackground1': '#334155',
					'editorWidget.background': '#1e293b',
					'editorWidget.border': '#334155',
					'scrollbarSlider.background': '#33415566',
					'scrollbarSlider.hoverBackground': '#47556999',
					'scrollbarSlider.activeBackground': '#64748bcc'
				}
			});

			monaco.editor.defineTheme('play-light', {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
					{ token: 'tag', foreground: 'db2777' },
					{ token: 'attribute.name', foreground: '334155' },
					{ token: 'attribute.value', foreground: '0284c7' },
					{ token: 'delimiter.html', foreground: '94a3b8' },
					{ token: 'string', foreground: '0284c7' },
					{ token: 'keyword', foreground: '7c3aed' }
				],
				colors: {
					'editor.background': '#ffffff',
					'editor.foreground': '#0f172a',
					'editor.lineHighlightBackground': '#f1f5f9',
					'editorLineNumber.foreground': '#94a3b8',
					'editorLineNumber.activeForeground': '#475569',
					'editor.selectionBackground': '#0ea5e926',
					'editorIndentGuide.background1': '#f1f5f9',
					'editorIndentGuide.activeBackground1': '#cbd5e1'
				}
			});

			monacoInstance = monaco;

			const instance = monaco.editor.create(containerRef, {
				value,
				language,
				theme: theme === 'dark' ? 'play-dark' : 'play-light',
				automaticLayout: false,
				minimap: { enabled: false },
				fontSize: 14,
				lineHeight: 22,
				fontFamily: "'JetBrains Mono', monospace",
				fontLigatures: true,
				wordWrap,
				readOnly,
				tabSize: 2,
				insertSpaces: true,
				padding: { top: 16, bottom: 16 },
				scrollBeyondLastLine: false,
				smoothScrolling: true,
				cursorBlinking: 'smooth',
				cursorSmoothCaretAnimation: 'on',
				renderLineHighlight: 'all',
				bracketPairColorization: { enabled: true },
				autoClosingBrackets: 'always',
				autoClosingQuotes: 'always',
				formatOnPaste: true,
				overviewRulerBorder: false,
				hideCursorInOverviewRuler: true
			});

			if (document.fonts?.ready) {
				document.fonts.ready.then(() => {
					if (!disposed) {
						monaco.editor.remeasureFonts();
					}
				});
			}

			instance.onDidChangeModelContent(() => {
				const currentVal = instance.getValue();
				isUpdatingFromEditor = true;
				value = currentVal;
				onChange?.(currentVal);
				isUpdatingFromEditor = false;
			});

			editor = instance;

			resizeObserver = new ResizeObserver(() => {
				instance.layout();
			});
			resizeObserver.observe(containerRef);
		})();

		return () => {
			disposed = true;
			resizeObserver?.disconnect();
			editor?.dispose();
		};
	});

	// Keep editor value synchronized when changed externally (e.g. Reset, Prettier, or derived output)
	$effect(() => {
		const targetValue = value;
		if (editor && !isUpdatingFromEditor && editor.getValue() !== targetValue) {
			const model = editor.getModel();
			const scrollTop = editor.getScrollTop();
			const scrollLeft = editor.getScrollLeft();
			isUpdatingFromEditor = true;
			if (model && !readOnly) {
				const position = editor.getPosition();
				editor.executeEdits('external-update', [
					{
						range: model.getFullModelRange(),
						text: targetValue,
						forceMoveMarkers: true
					}
				]);
				editor.pushUndoStop();
				if (position) {
					editor.setPosition(position);
				}
			} else {
				editor.setValue(targetValue);
			}
			editor.setScrollTop(scrollTop);
			editor.setScrollLeft(scrollLeft);
			isUpdatingFromEditor = false;
		}
	});

	// Sync theme changes
	$effect(() => {
		const currentTheme = theme;
		if (monacoInstance && editor) {
			monacoInstance.editor.setTheme(currentTheme === 'dark' ? 'play-dark' : 'play-light');
		}
	});

	// Sync wordWrap changes
	$effect(() => {
		const currentWrap = wordWrap;
		if (editor) {
			editor.updateOptions({ wordWrap: currentWrap });
		}
	});
</script>

<div class="monaco-wrapper" bind:this={containerRef}>
	{#if !editor}
		<div class="monaco-loading">
			<span class="spinner"></span>
			<span>Loading editor…</span>
		</div>
	{/if}
</div>
