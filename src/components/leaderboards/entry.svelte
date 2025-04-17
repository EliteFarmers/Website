<script lang="ts">
	import Gamemode from '$comp/stats/player/gamemode.svelte';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import { type LeaderboardInfo } from '$lib/constants/leaderboards';
	import { formatIgn } from '$lib/format';

	interface Props {
		entry: LeaderboardEntry;
		highlight?: boolean;
		rank: number;
		leaderboard?: LeaderboardInfo;
		showLeaderboardName?: boolean;
	}

	let { entry, highlight = false, rank, leaderboard, showLeaderboardName = false }: Props = $props();

	let options = $derived.by(() => {
		if (leaderboard?.id === 'skyblockxp') {
			return {
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
			};
		}

		if (leaderboard?.scoreDataType.toString() === 'Decimal') {
			return {
				maximumFractionDigits: 1,
				minimumFractionDigits: 1,
			};
		}

		return {
			maximumFractionDigits: 1,
		};
	});

	let ign = $state(entry.ign);
	let amount = $derived(leaderboard?.id === 'skyblockxp' ? (entry.amount ?? 0) / 100 : entry.amount);
	let profile = $state(entry.profile);
	let pageLink = $derived(entry.members ? entry.members[0].ign : ign);
	let profileLink = $derived(leaderboard?.profile ? entry.uuid : profile);

	let customStyles = $derived.by(() => {
		const lb = entry.meta?.leaderboard;
		if (!lb) return '';

		return (
			(lb?.backgroundColor ? `background-color: ${lb?.backgroundColor};` : '') +
			(lb?.borderColor ? `border-color: ${lb?.borderColor}; border-width: 2px;` : '') +
			(lb?.textColor ? `color: ${lb?.textColor};` : '')
		);
	});
</script>

<a
	href="/@{encodeURIComponent(pageLink ?? '')}/{encodeURIComponent(profileLink ?? '')}{leaderboard?.subpage ?? ''}"
	class="inline-block w-full max-w-xl border bg-card py-1 align-middle hover:bg-muted hover:shadow-lg sm:p-1 {highlight
		? 'border-completed'
		: ''} rounded-md"
	style={customStyles}
>
	<div class="flex items-center justify-between gap-0 md:gap-2">
		<div
			class="mx-2 flex flex-grow items-center justify-start gap-1 overflow-hidden text-ellipsis whitespace-nowrap align-middle sm:gap-2"
		>
			<div
				class="text-progress"
				style={entry.meta?.leaderboard?.rankColor ? `color: ${entry.meta?.leaderboard?.rankColor};` : ''}
			>
				<h1>
					<span class="xs:text-md text-sm sm:text-2xl">#</span><span class="xs:text-xl text-lg sm:text-3xl"
						>{rank}</span
					>
				</h1>
			</div>
			<!-- <Face {ign} base={face?.base} overlay={face?.overlay} /> -->
			<div class="flex flex-grow flex-col overflow-hidden text-ellipsis whitespace-nowrap">
				<p class="xs:text-xl inline-block text-start text-sm font-semibold sm:text-2xl">
					{#if leaderboard?.profile}
						{entry.members?.[0].ign}
					{:else}
						{formatIgn(ign, entry.meta)}
					{/if}
				</p>
				{#if leaderboard?.profile && entry.members?.length && entry.members.length > 1}
					<div class="xs:text-sm sm:text-md flex flex-row gap-1.5 text-start text-xs">
						<Gamemode popover={false} gameMode={entry.mode} class="mt-0.5 size-3" />
						{#each entry.members.slice(1, 3) ?? [] as member}
							<p>{member.ign}</p>
						{/each}
						{#if entry.members.length > 3}
							<p class="font-semibold">+{entry.members.length - 3}</p>
						{/if}
					</div>
				{:else}
					<div
						class="xs:text-sm sm:text-md flex flex-row gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-start text-xs"
					>
						<Gamemode popover={false} gameMode={entry.mode} class="mt-0.5 size-3" />
						{profile}
					</div>
				{/if}
			</div>
		</div>
		<div class="mr-2 flex flex-col items-end justify-center align-middle md:mx-2">
			<span class="xs:text-xl text-sm leading-none sm:text-2xl">
				{amount?.toLocaleString(undefined, options)}
			</span>
			{#if showLeaderboardName}
				<!-- <span class="text-xs xs:text-sm sm:text-md text-right text-muted-foreground leading-none">
					{leaderboard?.title}
				</span> -->
				<div
					class="xs:text-sm sm:text-md inline overflow-hidden text-ellipsis whitespace-nowrap text-start text-xs text-muted-foreground"
					style={entry.meta?.leaderboard?.rankColor ? `color: ${entry.meta?.leaderboard?.rankColor};` : ''}
				>
					{leaderboard?.short ?? leaderboard?.title}{leaderboard?.suffix ?? ''}
				</div>
			{/if}
		</div>
	</div>
</a>
