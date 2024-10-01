<script lang="ts">
	import { FarmingToolType, getCropDisplayName, type FarmingTool as FT } from 'farming-weight';
	import { FormatMinecraftText } from '$lib/format';
	import FortuneBreakdown from './fortune-breakdown.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import Lorebtn from '../lorebtn.svelte';
	import { UNUSED_MATHEMATICAL_HOE } from '$content/random';

	export let tool: FT;

	$: crop = tool.crop
		? PROPER_CROP_TO_IMG[getCropDisplayName(tool.crop)]
		: Object.values(PROPER_CROP_TO_IMG)[Math.floor(Math.random() * Object.keys(PROPER_CROP_TO_IMG).length)];
</script>

<div class="flex basis-[5rem] w-full max-h-30 flex-row gap-2 justify-between bg-primary-foreground rounded-md p-1">
	<div class="flex flex-row gap-2 items-center">
		<img
			class="w-14 md:w-20 md:h-20 aspect-square pixelated p-1"
			src="/packs/hypixelplus/tools/farming/{tool.item.skyblockId?.toLowerCase()}.png"
			alt="Tool"
		/>
		<div class="flex flex-col items-start">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="font-semibold text-md md:text-lg">{@html FormatMinecraftText(tool.item.name ?? '')}</div>
			{#if tool.supportsCultivating()}
				<div class="flex flex-row gap-1 items-center">
					<img src={crop} alt="Crop" class="pixelated w-5 h-5" />
					{#if tool.isUsed() || tool.farmed < 0}
						<div class="text-md md:text-lg">{tool.farmed.toLocaleString()}</div>
					{:else if tool.tool.type === FarmingToolType.MathematicalHoe}
						<div class="text-sm md:text-md text-muted-foreground">
							{UNUSED_MATHEMATICAL_HOE[Math.floor(Math.random() * UNUSED_MATHEMATICAL_HOE.length)]}
						</div>
					{:else}
						<div class="text-sm md:text-md text-muted-foreground">Missing Cultivating!</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<div class="flex flex-row items-center justify-end gap-2">
		<Lorebtn item={tool.item}>
			{#if tool.cultivating}
				<p>
					<span class="font-semibold select-none">Cultivating:</span>
					<span class="select-all">{tool.cultivating.toLocaleString()}</span>
				</p>
			{/if}
		</Lorebtn>
		<div class="flex flex-col items-end justify-between gap-1 p-1">
			<FortuneBreakdown total={tool.fortune} breakdown={tool.fortuneBreakdown} />
		</div>
	</div>
</div>
