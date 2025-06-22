<script lang="ts">
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
	}

	let { player, tools: toolList = $bindable(undefined), selectedToolId = $bindable(undefined) }: Props = $props();

	let selectedCrops = getSelectedCrops();
	let show = $state(2);
	let tools = $derived(toolList ?? $player.tools);

	let filtered = $derived(
		tools.filter((tool) => tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']).slice(0, show)
	);
</script>

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
	{/each}
	{#if $player.tools.filter((tool) => tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']).length > 2}
		<button
			onclick={toggleShow}
			class="hover:bg-card/50 flex w-fit cursor-pointer items-center justify-center rounded-lg border-[3px] border-solid border-transparent px-1 py-0.5 text-sm"
		>
			{show === 2 ? 'Show More' : 'Show Less'}
		</button>
	{/if}

	{#if !$player.tools.some((tool) => tool.crop && $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? ''])}
		<p class="my-4 text-center text-lg font-semibold">No matching tools found!</p>
	{/if}
</div>
