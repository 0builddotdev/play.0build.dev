<script lang="ts">
	import '#lib/assets/css/app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

{@render children()}
