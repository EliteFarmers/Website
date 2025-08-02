<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import type { FarmingTool } from 'farming-weight';
	import Toolconfig from './toolconfig.svelte';

	function toggleShow() {
		show = show === 2 ? 999 : 2;
	}

	interface Props {
		player: RatesPlayerStore;
		tools?: FarmingTool[] | undefined;
		selectedToolId?: string | undefined;
		selectedCropKey?: string | undefined;
	}

	let {
		player,
		tools: toolList = $bindable(undefined),
		selectedToolId = $bindable(undefined),
		selectedCropKey,
	}: Props = $props();

	let selectedCrops = getSelectedCrops();
	let show = $state(2);
	let tools = $derived(toolList ?? $player.tools);

	let filtered = $derived(
		tools.filter((tool) => tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']).slice(0, show)
	);
</script>

<div class="flex w-full flex-col items-center gap-4 rounded-md border p-4">
	<div class="flex w-full items-center justify-between">
		<p class="text-lg font-semibold">Farming Tool</p>
		{#if $player.selectedTool && $player.selectedTool.crop === selectedCropKey}
			<FortuneBreakdown breakdown={$player.selectedTool?.fortuneBreakdown} />
		{:else}
			<FortuneBreakdown total={0} />
		{/if}
	</div>
	<hr class="w-full" />
	<div class="-mx-2 mb-2 flex w-full flex-col gap-2">
		{#each filtered as tool (tool.item.uuid)}
			{@const selected = selectedToolId === tool.item.uuid}
			{#if tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']}
				<button
					onclick={() => {
						selectedToolId = tool.item.uuid ?? undefined;
						$player.selectTool(tool);
						player.refresh();
					}}
					class="{selected
						? 'border-muted'
						: 'border-transparent'} hover:bg-muted/30 flex w-full cursor-pointer flex-row items-center justify-start gap-2 rounded-lg border-[3px] border-solid px-1.5 py-0.5"
				>
					<Toolconfig {tool} {player} />
				</button>
			{/if}
		{:else}
			<p class="text-muted-foreground text-sm">No matching tools found!</p>
		{/each}
		{#if $player.tools.filter((tool) => tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']).length > 2}
			<button
				onclick={toggleShow}
				class="hover:bg-card/50 flex w-fit cursor-pointer items-center justify-center rounded-lg border-[3px] border-solid border-transparent px-1 py-0.5 text-sm"
			>
				{show === 2 ? 'Show More' : 'Show Less'}
			</button>
		{/if}
	</div>
</div>
