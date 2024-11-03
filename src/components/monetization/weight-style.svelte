<script lang="ts">
	import type { components } from '$lib/api/api';
	import { createFromData } from '$lib/styles/maker';
	import { validStyle } from '$lib/styles/style';
	import { onMount } from 'svelte';

	export let style: components['schemas']['WeightStyleWithDataDto'];
	export let account: components['schemas']['MinecraftAccountDto'] | undefined = undefined;
	export let weight: components['schemas']['FarmingWeightDto'] | undefined = undefined;

	let canvas: HTMLCanvasElement;

	onMount(async () => {
		(await createFromData(canvas, {
			account,
			profile: weight,
			data: validStyle(style.data) ? style.data : undefined,
		})) ?? '';
	});
</script>

<canvas bind:this={canvas} class="max-w-3xl w-full origin-top-left font-sans" />
