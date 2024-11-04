<script lang="ts">
	import type { components } from '$lib/api/api';
	import { createFromData } from '$lib/styles/maker';
	import { validStyle } from '$lib/styles/style';
	import { onMount } from 'svelte';

	export let style: components['schemas']['WeightStyleWithDataDto'];
	export let ign: string;
	export let uuid: string;
	export let weight: components['schemas']['FarmingWeightDto'] | undefined = undefined;

	let canvas: HTMLCanvasElement;
	let promise: Promise<unknown>;

	onMount(async () => {
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
{:catch error}
	<p style="color: red">Error loading preview image.</p>
{/await}
<canvas bind:this={canvas} class="w-full origin-top-left font-sans" />
