<script lang="ts">
	import ProgressBar from '$comp/stats/progress-bar.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import { Stat, STAT_ICONS, type FortuneSourceProgress } from 'farming-weight';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Info from '@lucide/svelte/icons/info';
	import * as Popover from '$ui/popover';

	interface Props {
		progress: FortuneSourceProgress;
		barBg?: string;
	}

	let { progress, barBg = 'bg-background' }: Props = $props();

	let maxed = $state(progress.ratio >= 1);
	let readable = $derived(
		(maxed
			? (+progress.fortune).toLocaleString()
			: (+progress.fortune).toLocaleString() + ' / ' + progress.maxFortune) +
			' ' +
			STAT_ICONS[Stat.FarmingFortune]
	);
	let expanded = $derived(
		maxed
			? (+progress.fortune).toLocaleString() + ' / ' + progress.maxFortune + ' ' + STAT_ICONS[Stat.FarmingFortune]
			: undefined
	);
</script>

<div class="flex w-full flex-col items-start">
	<div class="flex flex-row items-center gap-1">
		{#if progress.item?.name}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<span class="font-semibold">{@html FormatMinecraftText(progress.item.name)}</span>
		{:else}
			<span>{progress.name}</span>
		{/if}
		{#if progress.wiki}
			<a href={progress.wiki} target="_blank" rel="noopener noreferrer" class="mt-1 text-link">
				<Info size={16} />
			</a>
		{/if}
		{#if progress.api === false}
			<Popover.Mobile>
				{#snippet trigger()}
					<TriangleAlert size={16} class="-mb-1 text-completed" />
				{/snippet}
				<p class="max-w-sm text-sm">
					This fortune source is not available in the Hypixel API. Configure settings on this page to mark it
					as complete.
				</p>
			</Popover.Mobile>
		{/if}
	</div>
	<ProgressBar percent={progress.ratio * 100} {readable} {expanded} maxed={progress.ratio >= 1} {barBg} />
</div>
