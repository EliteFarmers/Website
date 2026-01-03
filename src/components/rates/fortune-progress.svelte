<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import ProgressBar from '$comp/stats/progress-bar.svelte';
	import TooltipSimple from '$ui/tooltip/tooltip-simple.svelte';
	import FileText from '@lucide/svelte/icons/file-text';
	import Info from '@lucide/svelte/icons/info';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Stat, STAT_ICONS, type FortuneSourceProgress } from 'farming-weight';

	interface Props {
		progress: FortuneSourceProgress;
		barBg?: string;
		useItemName?: boolean;
	}

	let { progress: p, barBg = 'bg-background', useItemName = true }: Props = $props();

	let progress = $derived.by(() => {
		if (p.active?.active !== false) return p;

		return {
			...p,
			ratio: p.active?.fortune ? p.active.fortune / p.max : 0,
			fortune: p.active?.fortune ?? 0,
			maxFortune: p.max,
			active: p.active,
		};
	});

	function getStatColor(stat: Stat, ratio: number): string | null {
		switch (stat) {
			case Stat.MelonFortune:
				return ratio < 1 ? 'bg-melon/70' : 'bg-melon';
			case Stat.PumpkinFortune:
				return ratio < 1 ? 'bg-pumpkin/70' : 'bg-pumpkin';
			case Stat.CactusFortune:
				return ratio < 1 ? 'bg-cactus/70' : 'bg-cactus';
			case Stat.SugarCaneFortune:
				return ratio < 1 ? 'bg-sugarcane/70' : 'bg-sugarcane';
			case Stat.CarrotFortune:
				return ratio < 1 ? 'bg-carrot/70' : 'bg-carrot';
			case Stat.PotatoFortune:
				return ratio < 1 ? 'bg-potato/70' : 'bg-potato';
			case Stat.WheatFortune:
				return ratio < 1 ? 'bg-wheat/70' : 'bg-wheat';
			case Stat.MushroomFortune:
				return ratio < 1 ? 'bg-mushroom/70' : 'bg-mushroom';
			case Stat.CocoaBeanFortune:
				return ratio < 1 ? 'bg-cocoa/70' : 'bg-cocoa';
			case Stat.MoonflowerFortune:
				return ratio < 1 ? 'bg-moonflower/70' : 'bg-moonflower';
			case Stat.NetherWartFortune:
				return ratio < 1 ? 'bg-netherwart/70' : 'bg-netherwart';
			case Stat.SunflowerFortune:
				return ratio < 1 ? 'bg-sunflower/70' : 'bg-sunflower';
			case Stat.WildRoseFortune:
				return ratio < 1 ? 'bg-wildrose/70' : 'bg-wildrose';
			default:
				return null;
		}
	}

	// let maxed = $derived(progress.ratio >= 1);
	// let readable = $derived(
	// 	(maxed
	// 		? (+progress.fortune || progress?.active?.fortune || 0).toLocaleString()
	// 		: (+progress.fortune || progress?.active?.fortune || 0).toLocaleString() + ' / ' + progress.maxFortune) +
	// 		' ' +
	// 		STAT_ICONS[Stat.FarmingFortune]
	// );
	// let expanded = $derived(
	// 	maxed
	// 		? (+progress.fortune || progress?.active?.fortune || 0).toLocaleString() +
	// 				' / ' +
	// 				progress.maxFortune +
	// 				' ' +
	// 				STAT_ICONS[Stat.FarmingFortune]
	// 		: undefined
	// );
</script>

<div class="flex w-full flex-col items-start">
	<div class="flex w-full items-center justify-between">
		<div class="flex h-10 flex-row items-center gap-1">
			{#if progress.item?.name && useItemName}
				{#if progress.item?.skyblockId}
					<ItemRender skyblockId={progress.item.skyblockId} class="size-10" />
				{/if}
				<ItemName name={progress.item.name} />
			{:else}
				<span>{progress.name}</span>
			{/if}
			{#if progress.wiki}
				<a href={progress.wiki} target="_blank" rel="noopener noreferrer" class="text-link">
					<Info size={16} />
				</a>
			{/if}
			{#if progress.api === false}
				<TooltipSimple side="bottom">
					{#snippet trigger()}
						<TriangleAlert size={16} class="text-completed" />
					{/snippet}
					<p class=" max-w-64 text-sm">
						This fortune source is not available in the Hypixel API. Configure settings on this page to mark
						it as complete.
					</p>
				</TooltipSimple>
			{/if}
		</div>
		{#if progress.active}
			<div class="flex flex-row items-center gap-1">
				<TooltipSimple side="left">
					{#snippet trigger()}
						{#if !progress.active?.active}
							<OctagonAlert size={16} class="text-completed" />
						{:else}
							<FileText size={16} class="text-muted-foreground" />
						{/if}
					{/snippet}
					<p class="max-w-32 text-sm">{progress.active.reason}</p>
				</TooltipSimple>
			</div>
		{/if}
	</div>
	<!-- <ProgressBar
		percent={progress.ratio * 100}
		{readable}
		{expanded}
		{maxed}
		{barBg}
		disabled={progress.active?.active === false}
	/> -->
	<!-- let statProgress: {
    current: number;
    max: number;
    ratio: number;
} -->
	{#each Object.entries(progress.stats ?? {}) as [stat, statProgress] (stat)}
		{@const color = getStatColor(stat as Stat, statProgress.ratio)}

		<ProgressBar
			{barBg}
			percent={statProgress.ratio * 100}
			readable={(statProgress.current || 0).toLocaleString() +
				' / ' +
				statProgress.max.toLocaleString() +
				' ' +
				STAT_ICONS[stat as Stat]}
			expanded={(statProgress.current || 0).toLocaleString() +
				' / ' +
				statProgress.max.toLocaleString() +
				' ' +
				STAT_ICONS[stat as Stat]}
			disabled={progress.active?.active === false}
			maxed={statProgress.ratio >= 1}
			fillClass={progress.stats === undefined ? 'bg-muted-foreground/30' : color ? color : undefined}
		/>
	{:else}
		{#each Object.entries(progress.progress ?? {}) as [stat, statProgress] (stat)}
			<ProgressBar
				{barBg}
				percent={statProgress.ratio * 100}
				readable={(statProgress.current || 0).toLocaleString() + ' / ' + statProgress.max.toLocaleString()}
				expanded={(statProgress.current || 0).toLocaleString() + ' / ' + statProgress.max.toLocaleString()}
				disabled={progress.active?.active === false}
				maxed={statProgress.ratio >= 1}
				fillClass={progress.stats === undefined ? 'bg-muted-foreground/30' : undefined}
			/>
		{/each}
	{/each}
</div>
