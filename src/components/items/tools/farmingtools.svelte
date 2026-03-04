<script lang="ts">
	import Farmingtool from '$comp/items/tools/farmingtool.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import { Skeleton } from '$ui/skeleton';
	import {
		calcWeightForCrop,
		Crop,
		FarmingTool as FT,
		getCropMilestoneLevels,
		type EliteItemDto,
	} from 'farming-weight';
	import { watch } from 'runed';

	const ctx = getStatsContext();

	const garden = $derived(ctx.garden);
	let shown = $state(13 - (ctx.member.current?.events?.length ?? 0));
	let currentShown = $state(13 - (ctx.member.current?.events?.length ?? 0));

	let actualTools = $state<FT[]>([]);

	watch(
		() => ctx.tools,
		(tools) => {
			const options = {
				milestones: getCropMilestoneLevels((garden?.crops ?? {}) as Record<string, number>),
			};

			actualTools = FT.fromArray(tools as EliteItemDto[], options).sort((a, b) => {
				return (
					calcWeightForCrop(b.crop ?? Crop.Wheat, b.farmed) -
					calcWeightForCrop(a.crop ?? Crop.Wheat, a.farmed)
				);
			});
		}
	);
</script>

{#if actualTools.length !== 0 || ctx.member.loading}
	<div class="flex flex-1 flex-col items-center gap-2">
		{#each actualTools.slice(0, currentShown) as tool, i (tool.item.uuid ?? i)}
			<Farmingtool {tool} />
		{/each}
		{#if ctx.member.loading}
			{#each { length: 10 }, i (i)}
				<div class="h-20 w-full flex-1">
					<div class="flex h-full flex-row items-center gap-2 p-1">
						<Skeleton class="aspect-square h-18 w-18 rounded-lg" />
						<div class="flex grow flex-row justify-between gap-1 pr-2">
							<div class="flex flex-1 flex-col items-start gap-2">
								<Skeleton class="h-6 w-1/2 rounded-md" />
								<Skeleton class="h-6 w-1/5 rounded-md" />
							</div>
							<div class="flex flex-row items-center gap-2 pb-0.5 md:pb-0">
								<Skeleton class="size-6 rounded-md" />
								<Skeleton class="h-6 w-16 rounded-md" />
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
		{#if currentShown < ctx.tools.length}
			<Button variant="outline" size="sm" onclick={() => (currentShown = ctx.tools.length)}>Show All</Button>
		{:else if ctx.tools.length > shown}
			<Button variant="outline" size="sm" onclick={() => (currentShown = shown)}>Show Less</Button>
		{/if}
	</div>
{/if}
