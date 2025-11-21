<script lang="ts">
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

	let ign = $state(entry.ign);
	let amount = $derived(entry.amount);
	let profile = $state(entry.profile);
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

	function getStyles(element: LeaderboardStyleText | undefined, defaultClass: string = ''): string {
		if (!element) return defaultClass;
		let styles = '';
		if (element.color) {
			styles += `color: ${element.color};`;
		}
		if (element.fontWeight) {
			styles += `font-weight: ${element.fontWeight};`;
		}
		return styles;
	}

	const hasStyle = $derived(style?.background?.imageUrl || entry.meta?.leaderboard?.styleId);
	const nameStyles = $derived(getStyles(style?.name));
	const rankStyles = $derived(getStyles(style?.rank));
	const subtitleStyles = $derived(getStyles(style?.subtitle));
	const scoreStyles = $derived(getStyles(style?.score));
</script>

<div
	class="bg-background group relative flex h-14 w-full max-w-xl flex-col items-center justify-center overflow-clip rounded-md border bg-no-repeat sm:h-16"
	style="justify-content: {style?.background?.align ?? 'center'};"
	data-sveltekit-preload-data="tap"
>
	{#if hasStyle}
		{@const img = style?.background?.imageUrl}
		<!-- svelte-ignore a11y_missing_attribute -->
		<img
			loading="lazy"
			src={img ?? `/api/lb-style/${entry.meta?.leaderboard?.styleId}/bg.webp`}
			class="bg-card group-hover:bg-muted z-0 w-full max-w-5xl bg-no-repeat {!img ? 'h-full' : ''}"
		/>
		<div class="absolute inset-0 rounded-sm bg-linear-to-r from-black/20 via-transparent to-black/20"></div>
	{/if}
	<a
		href={disabled
			? undefined
			: `/@${encodeURIComponent(pageLink ?? '')}/${encodeURIComponent(profileLink ?? '')}${leaderboard?.subpage ?? ''}`}
		class="absolute top-0 right-0 bottom-0 left-0 z-10 flex h-full w-full max-w-xl items-center py-1 align-middle sm:p-1 {highlight
			? 'border-completed'
			: ''} rounded-md {style ? 'text-shadow-md/40' : ''} {hasStyle ? 'dark text-primary' : ''}"
		style={customStyles}
	>
		<div class="flex flex-1 items-center justify-between gap-0 md:gap-2">
			<div
				class="mx-2 flex grow items-center justify-start gap-1 overflow-hidden align-middle text-ellipsis whitespace-nowrap sm:gap-2"
			>
				<div class={!style ? 'text-progress' : ''} style={rankStyles}>
					<span class="xs:text-md text-sm sm:text-2xl">#</span><span class="xs:text-xl text-lg sm:text-3xl"
						>{rank}</span
					>
				</div>
				<div class="flex grow flex-col overflow-hidden text-ellipsis whitespace-nowrap">
					<p class="xs:text-xl inline-block text-start text-sm font-semibold sm:text-2xl" style={nameStyles}>
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

{#snippet removed()}
	{#if entry.removed}
		<CircleSlash class="text-destructive size-4" />
	{/if}
{/snippet}
