<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import Farmingtool from '$comp/items/tools/farmingtool.svelte';
	import { FarmingTool as FT, getCropMilestoneLevels, type EliteItemDto, FarmingPet, Stat } from 'farming-weight';

	interface Props {
		tools: components['schemas']['ItemDto'][];
		garden?: components['schemas']['GardenDto'] | undefined;
		pets?: components['schemas']['PetDto'][];
		shown?: number;
	}

	let {
		tools,
		garden = undefined,
		pets = [],
		shown = 10
	}: Props = $props();

	let currentShown = $state(shown);

	let options = $derived({
		milestones: getCropMilestoneLevels(garden?.crops ?? {}),
		// Use the pet with the highest chimera farming fortune for fortune displayed on daedalus axe
		selectedPet: FarmingPet.fromArray(pets)
			.sort(
				(a, b) =>
					(b.getChimeraAffectedStats(1)?.[Stat.FarmingFortune] ?? 0) -
					(a.getChimeraAffectedStats(1)?.[Stat.FarmingFortune] ?? 0)
			)
			.at(0),
	});

	let actualTools = $derived(FT.fromArray(tools as EliteItemDto[], options));
</script>

{#if actualTools.length !== 0}
	<div class="flex flex-1 flex-col gap-2 items-center">
		{#each actualTools.slice(0, currentShown) as tool, i (tool.item.uuid ?? i)}
			<Farmingtool {tool} />
		{/each}
		{#if currentShown < tools.length}
			<Button variant="outline" size="sm" onclick={() => (currentShown = tools.length)}>Show All</Button>
		{:else if tools.length > shown}
			<Button variant="outline" size="sm" onclick={() => (currentShown = shown)}>Show Less</Button>
		{/if}
	</div>
{/if}
