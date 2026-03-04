<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import ProgressBar from '$comp/stats/progress-bar.svelte';
	import { getStatColor } from '$lib/format';
	import TooltipSimple from '$ui/tooltip/tooltip-simple.svelte';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Stat, STAT_ICONS, STAT_NAMES, type FortuneSourceProgress } from 'farming-weight';
	import FortuneActiveNote from './fortune-active-note.svelte';

	interface Props {
		progress: FortuneSourceProgress;
		barBg?: string;
		useItemName?: boolean;
	}

	let { progress: p, barBg = 'bg-background', useItemName = true }: Props = $props();

	let progress = $derived.by(() => {
		if (p.active?.active !== false) return p;

		// When inactive, use active.fortune for display instead of the 0 returned by the backend
		const inactiveFortune = p.active?.fortune ?? 0;
		const newStats: typeof p.stats = {};

		for (const [stat, statProgress] of Object.entries(p.stats ?? {})) {
			newStats[stat as keyof typeof newStats] = {
				...statProgress,
				current: inactiveFortune,
				ratio: inactiveFortune > 0 ? Math.min(inactiveFortune / statProgress.max, 1) : 0,
			};
		}

		return {
			...p,
			ratio: inactiveFortune ? inactiveFortune / p.max : 0,
			fortune: inactiveFortune,
			maxFortune: p.max,
			stats: Object.keys(newStats).length > 0 ? newStats : p.stats,
		};
	});

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

	const hasBars = $derived.by(() => {
		return (
			(progress.stats && Object.keys(progress.stats).length > 0) ||
			(progress.progress && Object.keys(progress.progress).length > 0)
		);
	});
</script>

{#if hasBars}
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
							This fortune source is not available in the Hypixel API. Configure settings on this page to
							mark it as complete.
						</p>
					</TooltipSimple>
				{/if}
			</div>
			<FortuneActiveNote {progress} />
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
		<div class="flex w-full flex-row items-center gap-1">
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
					expanded={STAT_ICONS[stat as Stat] + ' ' + STAT_NAMES[stat as Stat]}
					disabled={progress.active?.active === false}
					maxed={statProgress.ratio >= 1}
					fillClass={progress.stats === undefined ? 'bg-muted-foreground/30' : color ? color : undefined}
				/>
			{:else}
				{#each Object.entries(progress.progress ?? {}) as [stat, statProgress] (stat)}
					<ProgressBar
						{barBg}
						percent={statProgress.ratio * 100}
						readable={(statProgress.current || 0).toLocaleString() +
							' / ' +
							statProgress.max.toLocaleString()}
						expanded={(statProgress.current || 0).toLocaleString() +
							' / ' +
							statProgress.max.toLocaleString()}
						disabled={progress.active?.active === false}
						maxed={statProgress.ratio >= 1}
						fillClass={progress.stats === undefined ? 'bg-muted-foreground/30' : undefined}
					/>
				{/each}
			{/each}
		</div>
	</div>
{/if}
