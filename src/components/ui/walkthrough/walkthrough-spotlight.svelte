<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		top = 0,
		left = 0,
		width = 0,
		height = 0,
		open = false,
	}: {
		top: number;
		left: number;
		width: number;
		height: number;
		open: boolean;
	} = $props();
</script>

{#if open}
	<div
		transition:fade={{ duration: 300 }}
		class="pointer-events-none fixed z-9998 transition-all duration-500 ease-in-out"
		style="
            top: {top}px;
            left: {left}px;
            width: {width}px;
            height: {height}px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
            border-radius: 6px;
        "
	></div>
{/if}
