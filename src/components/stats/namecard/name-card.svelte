<script lang="ts">
	import LeaderboardRankLink from '$comp/leaderboards/leaderboard-rank-link.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import type { ImageAttachmentDto, WeightStyleElementDto } from '$lib/api';
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
	const avatar = $derived(nameCard?.elements.avatar);

	function coordinate(value: number, size: number) {
		if (value >= -1 && value <= 1) return value < 0 ? size + value * size : value * size;
		return value < -1 ? size + value : value;
	}

	function colorWithOpacity(color: string, opacity = 1) {
		return `color-mix(in srgb, ${color} ${Math.round(Math.min(1, Math.max(0, opacity)) * 100)}%, transparent)`;
	}

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

	function positionStyle(element: WeightStyleElementDto | null | undefined) {
		if (!element) return 'display:none';
		return `left:${(coordinate(element.position.x, 1920) / 19.2).toFixed(4)}cqw;top:${(coordinate(element.position.y, 400) / 19.2).toFixed(4)}cqw;`;
	}

	function boxStyle(element: WeightStyleElementDto | null | undefined, positioned = true) {
		if (!element) return 'display:none';
		let result = positioned ? positionStyle(element) : '';
		result += `font-size:${((element.fontSize ?? 48) / 19.2).toFixed(4)}cqw;font-family:${element.font ?? 'inherit'};color:${element.fill ?? 'inherit'};`;
		if (element.maxWidth)
			result += `max-width:${(coordinate(element.maxWidth, 1920) / 19.2).toFixed(4)}cqw;overflow:hidden;`;
		if (element.maxHeight)
			result += `max-height:${(coordinate(element.maxHeight, 400) / 19.2).toFixed(4)}cqw;overflow:hidden;`;
		if (element.background) {
			result += `background:${colorWithOpacity(element.background.fill ?? '#000000', element.background.opacity ?? 1)};padding:${((element.background.padding ?? 0) / 19.2).toFixed(4)}cqw;border-radius:${((element.background.radius ?? 0) / 19.2).toFixed(4)}cqw;`;
		}
		if (element.outline?.width) {
			const width = (element.outline.width / 19.2).toFixed(4);
			const color = colorWithOpacity(element.outline.fill ?? '#000000', element.outline.opacity ?? 1);
			result += `-webkit-text-stroke:${width}cqw ${color};paint-order:stroke fill;`;
		}
		if (element.glass) {
			const glass = element.glass;
			const tint = colorWithOpacity(glass.tintColor ?? '#ffffff', glass.tintOpacity ?? 0.2);
			const highlight = colorWithOpacity(glass.highlightColor ?? '#ffffff', glass.highlightOpacity ?? 0.8);
			result += `color:transparent;background-clip:text;-webkit-background-clip:text;background-image:linear-gradient(${glass.highlightAngle ?? -20}deg,${tint} ${Math.round((glass.highlightPosition ?? 0.25) * 100)}%,${highlight} ${Math.round(((glass.highlightPosition ?? 0.25) + (glass.highlightSize ?? 0.35)) * 100)}%,${tint} 100%);-webkit-text-stroke:${glass.rimWidth ?? 0.04}em ${colorWithOpacity(glass.rimColor ?? '#ffffff', glass.rimOpacity ?? 0.55)};filter:drop-shadow(${glass.shadowOffsetX ?? 0}em ${glass.shadowOffsetY ?? 0.06}em ${glass.shadowBlur ?? 0.12}em ${colorWithOpacity(glass.shadowColor ?? '#000000', glass.shadowOpacity ?? 0.35)});`;
		}
		return result;
	}

	const bg = $derived(
		style?.elements?.name?.outline
			? (style.elements.name.outline.fill ?? '#000000') +
					Math.round((style.elements.name.outline.opacity ?? 0.8) * 255).toString(16)
			: 'inherit'
	);
</script>

<div
	class="[container-type:inline-size] relative mx-auto mt-4 aspect-[4.8/1] w-full max-w-5xl overflow-visible lg:mt-16 @md:mt-8"
>
	<div
		class="bg-background {nameCard || style
			? 'dark text-primary'
			: ''} absolute inset-0 overflow-clip rounded-xl border-2 bg-no-repeat"
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
		{#if nameCard}
			{#if avatar}
				<img
					class="absolute z-10 object-contain"
					src={avatar.mode === 'head'
						? `https://mc-heads.net/avatar/${ctx.uuid}/256`
						: `https://skins.mcstats.com/body/front/${ctx.uuid}`}
					alt="User's Minecraft appearance"
					style="left:{coordinate(avatar.position.x, 1920) / 19.2}cqw;top:{coordinate(
						avatar.position.y,
						400
					) / 19.2}cqw;width:{(avatar.width ?? 240) / 19.2}cqw;height:{(avatar.height ?? 360) /
						19.2}cqw;opacity:{avatar.opacity ?? 1};"
				/>
			{/if}
			{#if nameCard.rankAnchor && nameCard.elements.name}
				<div
					class="absolute z-10 flex items-start whitespace-nowrap"
					style={positionStyle(nameCard.elements.name)}
				>
					<div style={boxStyle(nameCard.elements.name, false)}><PlayerName /></div>
					{#if rankText && nameCard.elements.rank}<div
							style="margin-left:{nameCard.rankAnchor.margin / 19.2}cqw;{boxStyle(
								nameCard.elements.rank,
								false
							)}"
						>
							{@render rankLink()}
						</div>{/if}
				</div>
			{:else}
				<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.name)}>
					<PlayerName />
				</div>
				{#if rankText}<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.rank)}>
						{@render rankLink()}
					</div>{/if}
			{/if}
			<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.weight)}><WeightNum /></div>
			<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.label)}>Farming Weight</div>
		{:else}
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
		{/if}
	</div>
	{#if frame?.imageUrl}
		<picture
			class="pointer-events-none absolute inset-0 z-20 origin-center"
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
	<LeaderboardRankLink
		class="hover:bg-muted flex h-full max-w-fit flex-col items-center justify-center rounded-md p-0.5 lg:p-1"
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
