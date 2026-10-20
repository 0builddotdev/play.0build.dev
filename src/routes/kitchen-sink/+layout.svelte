<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>0build</title>

	<link rel="preconnect" href="https://rsms.me/" />
	<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

	<style>
		:root {
			font-family: Inter, sans-serif;
			font-feature-settings:
				'liga' 1,
				'calt' 1;
			/* fix for Chrome */
		}

		@supports (font-variation-settings: normal) {
			:root {
				font-family: InterVariable, sans-serif;
			}
		}
	</style>

	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/css/kit.min.css"
	/>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/css/chart.min.css"
	/>

	<!-- Load the core file in the <head> -->
	<script
		src="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/js/hwc/core.iife.js"
		type="module"
	></script>

	<script
		defer
		src="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/js/uikit.min.js"
	></script>

	<!-- Optional: Runtime -->
	<script
		defer
		src="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/js/runtime.iife.js"
		type="module"
	></script>

	<!-- Optional: Icons -->
	<script
		defer
		src="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/js/hwc/icon.iife.js"
		type="module"
	></script>

	<!-- Optional: Charts -->
	<script
		defer
		src="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/js/hwc/chart.iife.js"
		type="module"
	></script>

	<!-- Load components last -->
	<script
		defer
		src="https://cdn.jsdelivr.net/gh/0builddotdev/0build@0.6.9/dist/js/hwc/components.iife.js"
		type="module"
	></script>

	<script>
		(function () {
			let originalClasses = document.documentElement.className || '';

			function applyUpdate(data) {
				if (data.classes !== undefined) {
					document.documentElement.className = (originalClasses + ' ' + data.classes).trim();
				}

				if (data.css !== undefined) {
					let styleTag = document.getElementById('z-theme-overrides');

					if (!styleTag) {
						styleTag = document.createElement('style');
						styleTag.id = 'z-theme-overrides';
						document.head.appendChild(styleTag);
					}
					styleTag.textContent = data.css;
				}
			}

			window.addEventListener('message', function (event) {
				if (event.data && event.data.type === 'THEME_UPDATE') {
					applyUpdate(event.data);
				}
			});

			window.addEventListener('load', function () {
				if (window.parent !== window) {
					window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
				}
			});
		})();
	</script>
</svelte:head>

{@render children()}
