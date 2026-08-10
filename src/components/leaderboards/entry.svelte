<script lang="ts">
	import { resolve } from '$app/paths';
	import Gamemode from '$comp/stats/player/gamemode.svelte';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import { type LeaderboardInfo } from '$lib/constants/leaderboards';
	import { formatIgn, formatLeaderboardAmount } from '$lib/format';
	import { isValidLeaderboardStyle, type LeaderboardStyleText } from '$lib/styles/style';
	import CircleSlash from '@lucide/svelte/icons/circle-slash';
	import type { Snippet } from 'svelte';

	interface Props {
		entry: LeaderboardEntry;
		highlight?: boolean;
		rank: number;
		leaderboard?: LeaderboardInfo;
		showLeaderboardName?: boolean;
		disabled?: boolean;
		namePrefix?: Snippet<
			[
				{
					entry: LeaderboardEntry;
					rank: number;
					leaderboard?: LeaderboardInfo;
				},
			]
		>;
	}

	let {
		entry,
		highlight = false,
		rank,
		leaderboard,
		showLeaderboardName = false,
		disabled = false,
		namePrefix,
	}: Props = $props();

	let ign = $derived(entry.ign);
	let amount = $derived(entry.amount);
	let profile = $derived(entry.profile);
	let pageLink = $derived(entry.members ? entry.members[0].ign : ign);
	let profileLink = $derived(leaderboard?.profile ? entry.uuid : profile);

	let customStyles = $derived.by(() => {
		const lb = entry.meta?.leaderboard;
		const style = entry?.style;
		if (!lb || !style) return '';

		return (
			(lb?.backgroundColor ? `background-color: ${lb?.backgroundColor};` : '') +
			(lb?.borderColor ? `border-color: ${lb?.borderColor};` : '') +
			(lb?.textColor ? `color: ${lb?.textColor};` : '')
		);
	});

	let style = $derived(isValidLeaderboardStyle(entry?.style) ? entry.style : undefined);
	const imageRef = $derived(entry.imageRefs?.[style?.background?.imageUrl ?? ''] ?? undefined);
	const overlayRef = $derived(entry.imageRefs?.[style?.overlay?.imageUrl ?? ''] ?? undefined);
	const frameRef = $derived(entry.frameImageRefs?.[entry.frame?.imageUrl ?? ''] ?? undefined);

	function srcset(image: typeof imageRef, poster = false): string | undefined {
		const sources = poster ? image?.posterSources : image?.sources;
		if (!sources) return undefined;
		return Object.values(sources)
			.map((source) => `${source.url} ${source.width}w`)
			.join(', ');
	}

	function focalY(layer: { positionY?: number; align?: 'flex-start' | 'center' | 'flex-end' } | undefined) {
		if (layer?.positionY !== undefined) return layer.positionY;
		return layer?.align === 'flex-start' ? 0 : layer?.align === 'flex-end' ? 100 : 50;
	}

	function frameTransform(scale: number | undefined) {
		const heightScale = scale ?? 1;
		const widthScale = 1 + (heightScale - 1) / 8;
		return `scaleX(${widthScale}) scaleY(${heightScale})`;
	}

	function getStyles(element: LeaderboardStyleText | undefined, defaultClass: string = ''): string {
		if (!element) return defaultClass;
		let styles = '';
		if (element.color) {
			styles += `color: ${element.color};`;
		}
		if (element.fontWeight) {
			styles += `font-weight: ${element.fontWeight};`;
		}
		if (element.glass) {
			const glass = element.glass;
			const tint = `color-mix(in srgb, ${glass.tintColor ?? '#ffffff'} ${Math.round((glass.tintOpacity ?? 0.2) * 100)}%, transparent)`;
			const highlight = `color-mix(in srgb, ${glass.highlightColor ?? '#ffffff'} ${Math.round((glass.highlightOpacity ?? 0.8) * 100)}%, transparent)`;
			styles += `color: transparent; background-clip: text; -webkit-background-clip: text;`;
			styles += `background-image: linear-gradient(${glass.highlightAngle ?? -20}deg, ${tint} ${Math.round((glass.highlightPosition ?? 0.25) * 100)}%, ${highlight} ${Math.round(((glass.highlightPosition ?? 0.25) + (glass.highlightSize ?? 0.35)) * 100)}%, ${tint} 100%);`;
			styles += `-webkit-text-stroke: ${glass.rimWidth ?? 0.04}em color-mix(in srgb, ${glass.rimColor ?? '#ffffff'} ${Math.round((glass.rimOpacity ?? 0.55) * 100)}%, transparent);`;
			styles += `filter: drop-shadow(${glass.shadowOffsetX ?? 0}em ${glass.shadowOffsetY ?? 0.06}em ${glass.shadowBlur ?? 0.12}em color-mix(in srgb, ${glass.shadowColor ?? '#000000'} ${Math.round((glass.shadowOpacity ?? 0.35) * 100)}%, transparent));`;
		}
		return styles;
	}

	const nameStyles = $derived(getStyles(style?.name));
	const rankStyles = $derived(getStyles(style?.rank));
	const subtitleStyles = $derived(getStyles(style?.subtitle));
	const scoreStyles = $derived(getStyles(style?.score));
	const gradientColor = $derived(style?.gradientColor ?? '#000000');
	const gradientOpacity = $derived(Math.min(1, Math.max(0, style?.gradientOpacity ?? 0.2)));
</script>

<div class="relative isolate aspect-[8/1] w-full max-w-xl overflow-visible">
	<div
		class="bg-background group {style
			? 'dark text-primary'
			: ''} absolute inset-0 flex flex-col items-center justify-center overflow-clip rounded-md border bg-no-repeat"
		style="justify-content: {style?.background?.align ?? 'center'}; background-color: {style?.background
			?.fillColor ?? ''}; border-color: {style?.background?.borderColor ?? ''};"
		data-sveltekit-preload-data="tap"
	>
		{#if style?.background?.imageUrl || entry.meta?.leaderboard?.styleId}
			{#if imageRef}
				<picture>
					{#if imageRef.posterUrl}<source
							media="(prefers-reduced-motion: reduce)"
							srcset={srcset(imageRef, true) ?? imageRef.posterUrl}
							sizes="(max-width: 576px) 100vw, 576px"
						/>{/if}
					<img
						loading="lazy"
						src={imageRef.url}
						srcset={srcset(imageRef)}
						sizes="(max-width: 576px) 100vw, 576px"
						alt=""
						aria-hidden="true"
						class="bg-card group-hover:bg-muted pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
						style="object-fit: {style?.background?.imageFit ?? 'cover'}; object-position: {style?.background
							?.positionX ?? 50}% {focalY(style?.background)}%; opacity: {style?.background
							?.imageOpacity ?? 1};"
					/>
				</picture>
			{:else}
				{@const img = style?.background?.imageUrl}
				{@const baseSrc = img ?? `/api/lb-style/${entry.meta?.leaderboard?.styleId}/bg.webp`}
				{@const srcset = img
					? undefined
					: `${baseSrc}?w=400 400w, ${baseSrc}?w=800 800w, ${baseSrc}?w=1280 1280w, ${baseSrc} 1920w`}
				<img
					loading="lazy"
					src={baseSrc}
					{srcset}
					sizes={srcset
						? '(max-width: 400px) 400px, (max-width: 800px) 800px, (max-width: 1280px) 1280px, 1920px'
						: undefined}
					alt=""
					aria-hidden="true"
					class="bg-card group-hover:bg-muted pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
					style="object-fit: {style?.background?.imageFit ?? 'cover'}; object-position: {style?.background
						?.positionX ?? 50}% {focalY(style?.background)}%; opacity: {style?.background?.imageOpacity ??
						1};"
				/>
			{/if}
			<div
				class="absolute inset-0 rounded-sm"
				style:background-image={`linear-gradient(to right, ${gradientColor} 0%, transparent 50%, ${gradientColor} 100%)`}
				style:opacity={gradientOpacity}
			></div>
		{/if}
		{#if style?.overlay?.imageUrl}
			<picture>
				{#if overlayRef?.posterUrl}<source
						media="(prefers-reduced-motion: reduce)"
						srcset={srcset(overlayRef, true) ?? overlayRef.posterUrl}
						sizes="(max-width: 576px) 100vw, 576px"
					/>{/if}
				<img
					src={overlayRef?.url ?? style.overlay.imageUrl}
					srcset={srcset(overlayRef)}
					sizes="(max-width: 576px) 100vw, 576px"
					alt=""
					aria-hidden="true"
					class="pointer-events-none absolute inset-0 z-[5] h-full w-full object-cover"
					style="object-fit: {style.overlay.imageFit ?? 'cover'}; object-position: {style.overlay.positionX ??
						50}% {focalY(style.overlay)}%; opacity: {style.overlay.imageOpacity ?? 1};"
				/>
			</picture>
		{/if}
		<a
			href={resolve(
				`/@${encodeURIComponent(pageLink ?? '')}/${encodeURIComponent(profileLink ?? '')}${leaderboard?.subpage ?? ''}`
			)}
			aria-disabled={disabled}
			tabindex={disabled ? -1 : undefined}
			onclick={(event) => {
				if (disabled) event.preventDefault();
			}}
			class="absolute top-0 right-0 bottom-0 left-0 z-10 flex h-full w-full max-w-xl items-center py-1 align-middle sm:p-1 {highlight
				? 'border-completed'
				: ''} rounded-md {style ? 'text-shadow-md/40' : ''}"
			style={customStyles}
		>
			<div class="flex flex-1 items-center justify-between gap-0 md:gap-2">
				<div
					class="mx-2 flex grow items-center justify-start gap-1 overflow-hidden align-middle text-ellipsis whitespace-nowrap sm:gap-2"
				>
					<div class={!style ? 'text-progress' : ''} style={rankStyles}>
						<span class="xs:text-md text-sm sm:text-2xl">#</span><span
							class="xs:text-xl text-lg sm:text-3xl">{rank}</span
						>
					</div>
					<div class="flex grow flex-col overflow-hidden text-ellipsis whitespace-nowrap">
						<p
							class="xs:text-xl inline-block text-start text-sm font-semibold sm:text-2xl"
							style={nameStyles}
						>
							{#if leaderboard?.profile}
								{entry.members?.[0].ign}
							{:else}
								{formatIgn(ign, entry.meta)}
							{/if}
						</p>
						{#if leaderboard?.profile && entry.members?.length && entry.members.length > 1}
							<div
								class="xs:text-sm sm:text-md flex flex-row gap-1.5 text-start text-xs"
								style={subtitleStyles}
							>
								{@render removed()}
								<Gamemode popover={false} gameMode={entry.mode} class="mt-0.5 size-3" />
								{#each entry.members.slice(1, 3) ?? [] as member, i (member.uuid ?? i)}
									<p>{member.ign}</p>
								{/each}
								{#if entry.members.length > 3}
									<p class="font-semibold">+{entry.members.length - 3}</p>
								{/if}
							</div>
						{:else}
							<div
								class="xs:text-sm sm:text-md flex flex-row gap-1.5 overflow-hidden text-start text-xs text-ellipsis whitespace-nowrap"
								style={subtitleStyles}
							>
								{@render removed()}
								<Gamemode popover={false} gameMode={entry.mode} class="mt-0.5 size-3" />
								{profile}
							</div>
						{/if}
					</div>
				</div>
				<div class="mr-2 flex flex-col items-end justify-center align-middle md:mx-2">
					<span class="xs:text-xl text-sm leading-none sm:text-2xl" style={scoreStyles}>
						{formatLeaderboardAmount(leaderboard, amount)}
					</span>
					{#if showLeaderboardName}
						<div
							class="xs:text-sm sm:text-md inline-flex items-center gap-1 overflow-hidden text-start text-xs text-ellipsis whitespace-nowrap"
							style={subtitleStyles}
						>
							{#if namePrefix}
								{@render namePrefix({ entry, rank, leaderboard })}
							{/if}
							{leaderboard?.short ?? leaderboard?.title}{leaderboard?.suffix ?? ''}
						</div>
					{/if}
				</div>
			</div>
		</a>
	</div>
	{#if entry.frame?.imageUrl}
		<picture
			class="pointer-events-none absolute inset-0 z-20 origin-center"
			style:transform={frameTransform(entry.frame.scale)}
		>
			{#if frameRef?.posterUrl}<source
					media="(prefers-reduced-motion: reduce)"
					srcset={srcset(frameRef, true) ?? frameRef.posterUrl}
					sizes="(max-width: 576px) 100vw, 576px"
				/>{/if}
			<img
				src={frameRef?.url ?? entry.frame.imageUrl}
				srcset={srcset(frameRef)}
				sizes="(max-width: 576px) 100vw, 576px"
				alt=""
				aria-hidden="true"
				class="h-full w-full object-fill"
				style:opacity={entry.frame.opacity ?? 1}
			/>
		</picture>
	{/if}
</div>

{#snippet removed()}
	{#if entry.removed}
		<CircleSlash class="text-destructive size-4" />
	{/if}
{/snippet}
