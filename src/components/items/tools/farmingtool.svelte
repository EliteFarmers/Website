<script lang="ts">
	import ThinProgressBar from '$comp/thin-progress-bar.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { toReadable } from '$lib/format';
	import { getCropDisplayName, type FarmingTool as FT } from 'farming-weight';
	import FormattedText from '../formatted-text.svelte';
	import ItemRender from '../item-render.svelte';
	import Lorebtn from '../lorebtn.svelte';
	import FortuneBreakdown from './fortune-breakdown.svelte';

	let { tool }: { tool: FT } = $props();

	const crop = $derived(
		tool.crop
			? PROPER_CROP_TO_IMG[getCropDisplayName(tool.crop)]
			: Object.values(PROPER_CROP_TO_IMG)[Math.floor(Math.random() * Object.keys(PROPER_CROP_TO_IMG).length)]
	);

	const displayedFarmCount = $derived.by(() => {
		const cultivating = tool.cultivating ?? 0;
		const counter = tool.counter ?? 0;
		return Math.max(cultivating, counter);
	});
</script>

<div class="bg-card flex max-h-30 w-full basis-20 flex-row justify-between gap-2 rounded-md p-1">
	<div class="flex w-full flex-row items-center gap-2">
		<ItemRender skyblockId={tool.item.skyblockId ?? 'DIAMOND_HOE'} class="pixelated h-16 w-16 md:m-2" />
		<div class="flex w-full flex-col items-start">
			<div class="text-md font-semibold md:text-lg">
				<FormattedText text={tool.item.name ?? 'Unknown Tool'} />
			</div>

			{#if tool.supportsCultivating()}
				<div class="flex w-full flex-col items-center gap-1 gap-x-4 sm:flex-row">
					{#if tool.level !== undefined}
						{@const p = tool.getCurrentLevelProgress()}
						<ThinProgressBar
							ratio={p.maxed ? 1 : (p.ratio ?? 0)}
							maxed={tool.level === 50}
							class="w-full max-w-30"
							title={p.goal !== undefined
								? `${toReadable(p.progress)}/${toReadable(p.goal)} (${((p.ratio ?? 0) * 100).toFixed(2)}%)`
								: p.maxed
									? 'Max'
									: undefined}
						>
							<div
								class="text-foreground pointer-events-none absolute inset-0 flex items-center justify-center align-middle font-mono text-sm leading-none font-extrabold"
								style="-webkit-text-stroke: 0.02rem var(--border);"
							>
								Lvl {p.level}
							</div>
						</ThinProgressBar>
					{/if}
					<div class="flex w-full flex-row items-center gap-1">
						<img src={crop} alt="Crop" class="pixelated h-5 w-5" />

						{#if tool.isUsed() || tool.farmed < 0}
							<div class="mb-0.5 text-sm leading-tight">
								{displayedFarmCount.toLocaleString()}
							</div>
						{:else}
							<div class="md:text-md text-muted-foreground text-sm">No Cultivating!</div>
						{/if}
					</div>
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
			{#if tool.counter && tool.counter !== tool.cultivating}
				<p>
					<span class="font-semibold select-none">Counter:</span>
					<span class="select-all">{tool.counter.toLocaleString()}</span>
				</p>
			{/if}
		</Lorebtn>
		<div class="flex flex-col items-end justify-between gap-1 p-1">
			<FortuneBreakdown total={tool.fortune} breakdown={tool.fortuneBreakdown} />
		</div>
	</div>
</div>
