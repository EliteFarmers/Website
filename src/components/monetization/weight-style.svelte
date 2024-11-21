<script lang="ts">
	import type { components } from '$lib/api/api';
	import { createFromData } from '$lib/styles/maker';
	import { validStyle } from '$lib/styles/style';
	import { onMount } from 'svelte';

	interface Props {
		style: components['schemas']['WeightStyleWithDataDto'];
		ign: string;
		uuid: string;
		weight?: components['schemas']['FarmingWeightDto'] | undefined;
	}

	let {
		style,
		ign,
		uuid,
		weight = undefined
	}: Props = $props();

	let canvas: HTMLCanvasElement | null = $state(null);
	let promise: Promise<unknown> | undefined = $state();

	onMount(async () => {
		if (!canvas) return;
		promise = createFromData(canvas, {
			account: { name: ign, id: uuid },
			profile: weight,
			data: validStyle(style.data) ? style.data : undefined,
		});
	});
</script>

{#await promise}
	<div class="w-full items-center justify-center">
		<p>Loading preview image...</p>
	</div>
{:catch}
	<p style="color: red">Error loading preview image.</p>
{/await}
<canvas bind:this={canvas} class="w-full origin-top-left font-sans"></canvas>
