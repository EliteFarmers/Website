<script lang="ts">
	import ProgressBar from '$comp/stats/progress-bar.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import TooltipSimple from '$ui/tooltip/tooltip-simple.svelte';
	import FileText from '@lucide/svelte/icons/file-text';
	import Info from '@lucide/svelte/icons/info';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Stat, STAT_ICONS, type FortuneSourceProgress } from 'farming-weight';

	interface Props {
		progress: FortuneSourceProgress;
		barBg?: string;
	}

	let { progress: p, barBg = 'bg-background' }: Props = $props();

	let progress = $derived.by(() => {
		if (p.active?.active !== false) return p;

		return {
			...p,
			ratio: p.active?.fortune ? p.active.fortune / p.maxFortune : 0,
			fortune: p.active?.fortune ?? 0,
			maxFortune: p.maxFortune,
			active: p.active,
		};
	});

	let maxed = $derived(progress.ratio >= 1);
	let readable = $derived(
		(maxed
			? (+progress.fortune || progress?.active?.fortune || 0).toLocaleString()
			: (+progress.fortune || progress?.active?.fortune || 0).toLocaleString() + ' / ' + progress.maxFortune) +
			' ' +
			STAT_ICONS[Stat.FarmingFortune]
	);
	let expanded = $derived(
		maxed
			? (+progress.fortune || progress?.active?.fortune || 0).toLocaleString() +
					' / ' +
					progress.maxFortune +
					' ' +
					STAT_ICONS[Stat.FarmingFortune]
			: undefined
	);
</script>

<div class="flex w-full flex-col items-start">
	<div class="flex w-full items-center justify-between">
		<div class="flex flex-row items-center gap-1">
			{#if progress.item?.name}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<span class="font-semibold">{@html FormatMinecraftText(progress.item.name)}</span>
			{:else}
				<span>{progress.name}</span>
			{/if}
			{#if progress.wiki}
				<a href={progress.wiki} target="_blank" rel="noopener noreferrer" class="text-link mt-1">
					<Info size={16} />
				</a>
			{/if}
			{#if progress.api === false}
				<TooltipSimple side="bottom">
					{#snippet trigger()}
						<TriangleAlert size={16} class="text-completed -mb-1" />
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
							<OctagonAlert size={16} class="text-completed -mb-1" />
						{:else}
							<FileText size={16} class="text-muted-foreground -mb-1" />
						{/if}
					{/snippet}
					<p class="max-w-32 text-sm">{progress.active.reason}</p>
				</TooltipSimple>
			</div>
		{/if}
	</div>
	<ProgressBar
		percent={progress.ratio * 100}
		{readable}
		{expanded}
		{maxed}
		{barBg}
		disabled={progress.active?.active === false}
	/>
</div>
