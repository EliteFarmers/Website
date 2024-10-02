<script lang="ts">
	import ProgressBar from '$comp/stats/progress-bar.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import { Stat, STAT_ICONS, type FortuneSourceProgress } from 'farming-weight';
	import { TriangleAlert } from 'lucide-svelte';
	import Info from 'lucide-svelte/icons/info';
	import * as Popover from '$ui/popover';

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
			<span class="font-semibold">{@html FormatMinecraftText(progress.item.name)}</span>
		{:else}
			<span>{progress.name}</span>
		{/if}
		{#if progress.wiki}
			<a href={progress.wiki} target="_blank" rel="noopener noreferrer" class="text-blue-500 mt-1">
				<Info size={16} />
			</a>
		{/if}
		{#if progress.api === false}
			<Popover.Mobile>
				<div slot="trigger">
					<TriangleAlert size={16} class="-mb-1 text-yellow-600 dark:text-yellow-300" />
				</div>
				<p class="text-sm max-w-sm">
					This fortune source is not available in the Hypixel API. For it to show up you need to configure
					settings on this page.
				</p>
			</Popover.Mobile>
		{/if}
	</div>
	<ProgressBar percent={progress.ratio * 100} {readable} {expanded} maxed={progress.ratio >= 1} {barBg} />
</div>
