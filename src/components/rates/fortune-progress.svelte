<script lang="ts">
	import ProgressBar from '$comp/stats/progress-bar.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import { Stat, STAT_ICONS, type FortuneSourceProgress } from 'farming-weight';
	import Info from 'lucide-svelte/icons/info';

	export let progress: FortuneSourceProgress;
	export let barBg = 'bg-card';

	$: maxed = progress.ratio >= 1;
	$: readable =
		(maxed
			? (+progress.fortune).toLocaleString()
			: (+progress.fortune).toLocaleString() + ' / ' + progress.maxFortune) +
		' ' +
		STAT_ICONS[Stat.FarmingFortune];
	$: expanded = maxed
		? (+progress.fortune).toLocaleString() + ' / ' + progress.maxFortune + ' ' + STAT_ICONS[Stat.FarmingFortune]
		: undefined;
</script>

<div class="flex flex-col items-start w-full">
	<div class="flex flex-row items-center gap-1">
		{#if progress.item?.name}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<span>{@html FormatMinecraftText(progress.item.name)}</span>
		{:else}
			<span>{progress.name}</span>
		{/if}
		{#if progress.wiki}
			<a href={progress.wiki} target="_blank" rel="noopener noreferrer" class="text-blue-500 mt-1">
				<Info size={16} />
			</a>
		{/if}
	</div>

	<ProgressBar percent={progress.ratio * 100} {readable} {expanded} maxed={progress.ratio >= 1} {barBg} />
</div>
