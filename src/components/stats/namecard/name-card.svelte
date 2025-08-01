<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import WeightNum from './weight-num.svelte';
	import { drawBackgroundCanvas } from '$lib/styles/maker';
	import { isValidWeightStyle } from '$lib/styles/style';
	import TextElement from './text-element.svelte';
	import StatElements from './stat-elements.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';

	const ctx = getStatsContext();
	const style = $derived(isValidWeightStyle(ctx.style?.data) ? ctx.style.data : undefined);
	const rank = $derived(ctx.allRanks?.farmingweight?.rank ?? -1);
	const rankText = $derived(rank !== -1 ? `#${rank}` : '');

	const bg = $derived(
		style?.elements?.name?.outline
			? (style.elements.name.outline.fill ?? '#000000') +
					Math.round((style.elements.name.outline.opacity ?? 0.8) * 255).toString(16)
			: 'inherit'
	);
</script>

<div
	class="bg-background relative mx-auto mt-4 w-full max-w-5xl overflow-clip rounded-xl border-2 bg-no-repeat lg:mt-16 @md:mt-8 @md:aspect-[4.8/1]"
>
	<canvas
		{@attach (element) => {
			if (element) {
				drawBackgroundCanvas(element, style);
			}
		}}
		class="z-0 w-full max-w-5xl bg-no-repeat @md:aspect-[4.8/1]"
	>
	</canvas>
	<div class="absolute top-0 right-0 bottom-0 left-0 z-10 flex h-full flex-row items-center justify-between p-4">
		<div
			class="flex h-full w-full flex-row items-center justify-center gap-4 @md:gap-8 {style
				? '@md:justify-start'
				: ''}"
		>
			<img
				class="hidden h-full flex-1 self-center object-contain @md:inline-block @md:flex-none"
				src="https://mc-heads.net/body/{ctx.uuid}"
				alt="User's Minecraft appearance"
			/>
			<div class="block @md:hidden">
				<PlayerHead uuid={ctx.uuid} size="2xl" />
			</div>
			<div class="flex h-full flex-col items-start justify-center gap-1">
				<div class="hidden flex-row items-center gap-2 pt-2 @md:flex">
					<div class={!style ? 'rounded-md border' : ''}>
						<PlayerName
							bgStyle="background-color: {bg}; border-color: transparent; color: {style?.elements?.name
								?.fill ?? 'inherit'};"
						/>
					</div>
					{#if rankText}
						<TextElement class="h-full" element={style?.elements?.rank}>
							<div class="{!style ? 'rounded-md border' : ''} h-full">
								{@render rankLink()}
							</div>
						</TextElement>
					{/if}
				</div>
				<TextElement element={style?.elements?.weight}>
					<div class="flex flex-col items-end">
						<WeightNum />
						{#if bg == 'inherit'}
							<span class="font-muted-foreground mb-0.5 hidden pr-1 text-xs md:inline-block md:text-sm"
								>Farming Weight</span
							>
						{/if}
					</div>
				</TextElement>
			</div>
		</div>
		<div class="hidden flex-1 @md:block"></div>
	</div>
</div>

<StatElements>
	<div class="block @md:hidden">
		<PlayerName />
	</div>
	{#if rankText}
		<div class="block rounded-md border @md:hidden">
			{@render rankLink(true)}
		</div>
	{/if}
</StatElements>

{#snippet rankLink(small = false)}
	<a
		class="hover:bg-muted flex h-full max-w-fit flex-col items-center justify-center rounded-md p-0.5 lg:p-1"
		href="/leaderboard/farmingweight/{ctx.ign}-{ctx.selectedProfile?.profileName}"
		style="background-color: {small
			? 'inherit'
			: bg}; border-color: transparent; background-opacity: 0.8; color: {(!small
			? style?.elements?.name?.fill
			: undefined) ?? 'inherit'};"
		data-sveltekit-preload-data="tap"
	>
		<span class="mx-1 px-2 font-mono text-3xl">
			<span class="mr-0.5 text-xl">#</span>{rank}
		</span>
	</a>
{/snippet}
