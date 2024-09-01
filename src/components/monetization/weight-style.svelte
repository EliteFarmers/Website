<script lang="ts">
	import type { components } from "$lib/api/api";
	import { onMount } from "svelte";

	export let style: components["schemas"]['WeightStyleWithDataDto'];

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.font = "bold 48px sans-serif";
		ctx.fillStyle = "black";
		ctx.fillText('Test', 10, 50);

		ctx.font = "bold 24px sans-serif";
		ctx.fillStyle = "black";
		ctx.fillText('Hi', 10, 100);
	});
</script>

<canvas bind:this={canvas}></canvas>