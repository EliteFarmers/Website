<script lang="ts">
	import type { FarmingWeightDto, WeightStyleWithDataDto } from '$lib/api';
	import { createFromData } from '$lib/styles/maker';
	import { isValidWeightStyle } from '$lib/styles/style';

	interface Props {
		style: WeightStyleWithDataDto;
		ign: string;
		uuid: string;
		weight?: FarmingWeightDto | undefined;
		rank?: number;
		badgeUrl?: string;
	}

	let { style, ign, uuid, weight = undefined, badgeUrl, rank }: Props = $props();

	let canvas: HTMLCanvasElement | null = $state(null);
	let promise: Promise<unknown> | undefined = $state();

	$effect.pre(() => {
		if (!canvas) return;
		promise = createFromData(canvas, {
			account: { name: ign, id: uuid },
			profile: weight,
			data: isValidWeightStyle(style.data) ? style.data : undefined,
			badgeUrl: badgeUrl,
			weightRank: rank,
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
