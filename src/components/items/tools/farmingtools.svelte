<script lang="ts">
	import { Button } from '$ui/button';
	import Farmingtool from '$comp/items/tools/farmingtool.svelte';
	import {
		calcWeightForCrop,
		Crop,
		FarmingTool as FT,
		getCropMilestoneLevels,
		type EliteItemDto,
	} from 'farming-weight';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { watch } from 'runed';

	const ctx = getStatsContext();

	const garden = $derived(ctx.garden);
	let shown = $state(10 - (ctx.member.events?.length ?? 0));
	let currentShown = $state(10 - (ctx.member.events?.length ?? 0));

	let actualTools = $state<FT[]>([]);

	watch(
		() => ctx.tools,
		(tools) => {
			const options = {
				milestones: getCropMilestoneLevels(garden?.crops ?? {}),
			};

			actualTools = FT.fromArray(tools as EliteItemDto[], options).sort((a, b) => {
				const aCounter =
					a.counter !== undefined && a.counter !== null ? a.counter : Math.abs(a.cultivating ?? 0);
				const bCounter =
					b.counter !== undefined && b.counter !== null ? b.counter : Math.abs(b.cultivating ?? 0);

				return (
					calcWeightForCrop(b.crop ?? Crop.Wheat, bCounter) -
					calcWeightForCrop(a.crop ?? Crop.Wheat, aCounter)
				);
			});
		}
	);
</script>

{#if actualTools.length !== 0}
	<div class="flex flex-1 flex-col items-center gap-2">
		{#each actualTools.slice(0, currentShown) as tool, i (tool.item.uuid ?? i)}
			<Farmingtool {tool} />
		{/each}
		{#if currentShown < ctx.tools.length}
			<Button variant="outline" size="sm" onclick={() => (currentShown = ctx.tools.length)}>Show All</Button>
		{:else if ctx.tools.length > shown}
			<Button variant="outline" size="sm" onclick={() => (currentShown = shown)}>Show Less</Button>
		{/if}
	</div>
{/if}
