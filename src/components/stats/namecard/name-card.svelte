<script lang="ts">
	import LeaderboardRankLink from '$comp/leaderboards/leaderboard-rank-link.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import ResponsiveNameCard from '$comp/name-card/responsive-name-card.svelte';
	import type { ImageAttachmentDto } from '$lib/api';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { drawBackgroundCanvas } from '$lib/styles/maker';
	import { isValidWeightStyle } from '$lib/styles/style';
	import StatElements from './stat-elements.svelte';
	import TextElement from './text-element.svelte';
	import WeightNum from './weight-num.svelte';

	const ctx = getStatsContext();
	const legacyStyle = $derived(isValidWeightStyle(ctx.style?.data) ? ctx.style.data : undefined);
	const nameCard = $derived(ctx.style?.nameCard);
	const style = $derived(legacyStyle);
	const rank = $derived(ctx.allRanks?.farmingweight?.rank ?? -1);
	const rankText = $derived(rank !== -1 ? `#${rank}` : '');
	const backgroundStyle = $derived(
		nameCard
			? {
					decal: nameCard.decal,
					elements: { background: nameCard.background, gradients: nameCard.gradients },
				}
			: legacyStyle
	);
	const frame = $derived(ctx.nameCardFrame?.frame?.nameCard);
	const frameImage = $derived(frame?.imageUrl ? ctx.nameCardFrame?.imageRefs?.[frame.imageUrl] : undefined);
	function frameTransform(scale: number | undefined) {
		const heightScale = scale ?? 1;
		const widthScale = 1 + (heightScale - 1) / 4.8;
		return `scaleX(${widthScale}) scaleY(${heightScale})`;
	}

	function imageSrcset(image: ImageAttachmentDto | undefined, poster = false) {
		const sources = poster ? image?.posterSources : image?.sources;
		if (!sources) return undefined;
		return Object.values(sources)
			.map((source) => `${source.url} ${source.width}w`)
			.join(', ');
	}

	const bg = $derived(
		style?.elements?.name?.outline
			? (style.elements.name.outline.fill ?? '#000000') +
					Math.round((style.elements.name.outline.opacity ?? 0.8) * 255).toString(16)
			: 'inherit'
	);
</script>

{#if nameCard}
	<div class="relative mx-auto mt-4 w-full max-w-5xl lg:mt-16 @md:mt-8">
		<ResponsiveNameCard
			card={nameCard}
			ign={ctx.ignMeta}
			uuid={ctx.uuid}
			{rank}
			weight={ctx.member.current?.farmingWeight?.totalWeight ??
				ctx.selectedProfile?.members.find((m) => m.uuid === ctx.uuid)?.farmingWeight ??
				0}
			imageRefs={ctx.style?.imageRefs}
			{frame}
			frameImageRefs={ctx.nameCardFrame?.imageRefs}
		>
			{#snippet nameContent()}<PlayerName responsive />{/snippet}
			{#snippet rankContent()}
				<LeaderboardRankLink
					category="farmingweight"
					player={ctx.ign}
					profile={ctx.selectedProfile?.profileName}
					{rank}
					class="rounded-sm hover:bg-muted focus-visible:outline-2"
					>#{rank.toLocaleString('en-US')}</LeaderboardRankLink
				>
			{/snippet}
		</ResponsiveNameCard>
	</div>
{:else}
	<div
		class="[container-type:inline-size] relative mx-auto mt-4 aspect-[4.8/1] w-full max-w-5xl overflow-visible lg:mt-16 @md:mt-8"
	>
		<div
			class="bg-background {nameCard || style
				? 'dark text-primary'
				: 'text-foreground'} absolute inset-0 overflow-clip rounded-xl border-2 bg-no-repeat"
		>
			<canvas
				{@attach (element) => {
					if (element) {
						drawBackgroundCanvas(
							element,
							backgroundStyle as Parameters<typeof drawBackgroundCanvas>[1],
							ctx.style?.imageRefs
						);
					}
				}}
				width="1920"
				height="400"
				class="absolute inset-0 z-0 h-full w-full bg-no-repeat"
			>
			</canvas>
			<div class="absolute inset-0 z-10 flex h-full flex-row items-center justify-between p-4">
				<div
					class="flex h-full w-full flex-row items-center justify-center gap-4 @md:gap-8 {style
						? '@md:justify-start'
						: ''}"
				>
					<img
						class="hidden h-full flex-1 self-center object-contain @lg:ml-8 @lg:inline-block @lg:flex-none"
						src="https://skins.mcstats.com/body/front/{ctx.uuid}"
						alt="User's Minecraft appearance"
					/>
					<div class="block @lg:hidden">
						<PlayerHead uuid={ctx.uuid} size="2xl" />
					</div>
					<div class="flex h-full flex-col items-start justify-center gap-1">
						<div class="hidden flex-row items-center gap-2 pt-2 @lg:flex">
							<div class={!style ? 'rounded-md border' : ''}>
								<PlayerName
									bgStyle="background-color: {bg}; border-color: transparent; color: {style?.elements
										?.name?.fill ?? 'inherit'};"
									class={style ? 'text-shadow-[brightness(currentColor, 70%)]/30 text-shadow-md' : ''}
								/>
							</div>
							{#if rankText}
								<TextElement
									class="{style
										? 'text-shadow-[brightness(currentColor, 70%)]/30 text-shadow-md'
										: ''} h-full"
									element={style?.elements?.rank}
								>
									<div class="{!style ? 'rounded-md border' : ''} h-full">
										{@render rankLink()}
									</div>
								</TextElement>
							{/if}
						</div>
						<TextElement
							element={style?.elements?.weight}
							class={style ? 'text-shadow-[brightness(currentColor, 70%)]/30 text-shadow-md' : ''}
						>
							<div class="flex flex-col items-end">
								<WeightNum />
								{#if bg == 'inherit'}
									<span
										class="font-muted-foreground mb-0.5 hidden pr-1 text-xs md:inline-block md:text-sm"
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
		{#if frame?.imageUrl}
			<!-- Match the frame editor's positioning inside the card's 2px border. -->
			<picture
				class="pointer-events-none absolute inset-[2px] z-20 origin-center"
				style:transform={frameTransform(frame.scale)}
			>
				{#if frameImage?.posterUrl}<source
						media="(prefers-reduced-motion: reduce)"
						srcset={imageSrcset(frameImage, true) ?? frameImage.posterUrl}
						sizes="(max-width: 1024px) 100vw, 1024px"
					/>{/if}
				<img
					src={frameImage?.url ?? frame.imageUrl}
					srcset={imageSrcset(frameImage)}
					sizes="(max-width: 1024px) 100vw, 1024px"
					alt=""
					aria-hidden="true"
					class="h-full w-full"
					style:opacity={frame.opacity ?? 1}
				/>
			</picture>
		{/if}
	</div>
{/if}

<StatElements>
	{#if !nameCard}
		<div class="block @md:hidden">
			<PlayerName />
		</div>
		{#if rankText}
			<div class="block rounded-md border @md:hidden">
				{@render rankLink(true)}
			</div>
		{/if}
	{/if}
</StatElements>

{#snippet rankLink(small = false)}
	<LeaderboardRankLink
		class="flex h-full max-w-fit flex-col items-center justify-center rounded-md p-0.5 hover:bg-muted lg:p-1"
		category="farmingweight"
		player={ctx.ign}
		profile={ctx.selectedProfile?.profileName}
		{rank}
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
	</LeaderboardRankLink>
{/snippet}
