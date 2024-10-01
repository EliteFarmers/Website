<script lang="ts">
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import Toolconfig from './toolconfig.svelte';

	export let player: RatesPlayerStore;

	let selectedCrops = getSelectedCrops();
	let show = 2;

	function toggleShow() {
		show = show === 2 ? 999 : 2;
	}

	export let selectedToolId: string | undefined = undefined;
</script>

<div class="flex flex-col gap-2 w-full mb-2 -mx-2">
	{#each $player.tools.slice(0, 2) as tool (tool.item.uuid)}
		{@const selected = selectedToolId === tool.item.uuid}
		{#if tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']}
			<button
				on:click={() => {
					selectedToolId = tool.item.uuid ?? undefined;
					$player.selectTool(tool);
				}}
				class="{selected
					? 'border-primary-content/20 dark:border-card/70'
					: 'border-transparent'} border-solid border-[3px] hover:bg-primary-content/10 dark:hover:bg-card/50 px-1.5 py-0.5 rounded-lg cursor-pointer flex flex-row gap-2 justify-start items-center w-full"
			>
				<Toolconfig {tool} {player} />
			</button>
		{/if}
	{/each}
	{#if $player.tools.filter((tool) => tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']).length > 2}
		<button
			on:click={toggleShow}
			class="w-fit text-sm border-transparent border-solid border-[3px] hover:bg-card/50 px-1 py-0.5 rounded-lg cursor-pointer flex justify-center items-center"
		>
			{show === 2 ? 'Show More' : 'Show Less'}
		</button>
	{/if}

	{#if !$player.tools.some((tool) => tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? ''])}
		<p class="text-lg font-semibold text-center my-4">No matching tools found!</p>
	{/if}
</div>
