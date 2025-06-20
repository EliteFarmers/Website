<script lang="ts">
	import { FarmingToolType, getCropDisplayName, type FarmingTool as FT } from 'farming-weight';
	import { FormatMinecraftText } from '$lib/format';
	import FortuneBreakdown from './fortune-breakdown.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import Lorebtn from '../lorebtn.svelte';
	import { UNUSED_MATHEMATICAL_HOE } from '$content/random';

	let { tool }: { tool: FT } = $props();

	const crop = $derived(
		tool.crop
			? PROPER_CROP_TO_IMG[getCropDisplayName(tool.crop)]
			: Object.values(PROPER_CROP_TO_IMG)[Math.floor(Math.random() * Object.keys(PROPER_CROP_TO_IMG).length)]
	);
</script>

<div class="max-h-30 flex w-full basis-20 flex-row justify-between gap-2 rounded-md bg-card p-1">
	<div class="flex flex-row items-center gap-2">
		<img
			class="pixelated aspect-square w-14 p-1 md:h-20 md:w-20"
			src="/packs/hypixelplus/tools/farming/{tool.item.skyblockId?.toLowerCase()}.png"
			alt="Tool"
		/>
		<div class="flex flex-col items-start">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="text-md font-semibold md:text-lg">{@html FormatMinecraftText(tool.item.name ?? '')}</div>
			{#if tool.supportsCultivating()}
				<div class="flex flex-row items-center gap-1">
					<img src={crop} alt="Crop" class="pixelated h-5 w-5" />
					{#if tool.isUsed() || tool.farmed < 0}
						<div class="text-md md:text-lg">{tool.farmed.toLocaleString()}</div>
					{:else if tool.tool.type === FarmingToolType.MathematicalHoe}
						<div class="md:text-md text-sm text-muted-foreground">
							{UNUSED_MATHEMATICAL_HOE[Math.floor(Math.random() * UNUSED_MATHEMATICAL_HOE.length)]}
						</div>
					{:else}
						<div class="md:text-md text-sm text-muted-foreground">Missing Cultivating!</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<div class="flex flex-row items-center justify-end gap-2">
		<Lorebtn item={tool.item}>
			{#if tool.cultivating}
				<p>
					<span class="select-none font-semibold">Cultivating:</span>
					<span class="select-all">{tool.cultivating.toLocaleString()}</span>
				</p>
			{/if}
		</Lorebtn>
		<div class="flex flex-col items-end justify-between gap-1 p-1">
			<FortuneBreakdown total={tool.fortune} breakdown={tool.fortuneBreakdown} />
		</div>
	</div>
</div>
