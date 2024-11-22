<script lang="ts">
	import { page } from '$app/stores';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import { type LeaderboardConfig } from '$lib/constants/leaderboards';

	interface Props {
		entry: LeaderboardEntry;
		highlight?: boolean;
		rank: number;
		formatting?: 'number' | 'decimal';
		leaderboard?: LeaderboardConfig | undefined;
		showLeaderboardName?: boolean;
	}

	let {
		entry,
		highlight = false,
		rank,
		formatting = 'number',
		leaderboard = undefined,
		showLeaderboardName = false,
	}: Props = $props();

	let options = $derived.by(() => {
		if (formatting === 'decimal') {
			return {
				maximumFractionDigits: 1,
				minimumFractionDigits: 1,
			};
		} else if ($page.params.category === 'skyblockxp') {
			return {
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
			};
		}

		return {
			maximumFractionDigits: 1,
		};
	});

	let ign = $state(entry.ign);
	let amount = $derived($page.params.category === 'skyblockxp' ? (entry.amount ?? 0) / 100 : entry.amount);
	let profile = $state(entry.profile);
	let pageLink = $derived(entry.members ? entry.members[0].ign : ign);
	let profileLink = $derived(leaderboard?.profile ? entry.uuid : profile);
</script>

<a
	href="/@{encodeURIComponent(pageLink ?? '')}/{encodeURIComponent(profileLink ?? '')}{leaderboard?.subpage ?? ''}"
	class="inline-block w-full max-w-2xl border-2 bg-primary-foreground py-1 align-middle hover:bg-muted hover:shadow-lg sm:p-1 {highlight
		? 'border-yellow-400'
		: 'border-transparent'} rounded-md"
>
	<div class="flex items-center justify-between gap-0 md:gap-2">
		<div
			class="mx-2 flex flex-grow items-center justify-start gap-1 overflow-hidden text-ellipsis whitespace-nowrap align-middle sm:gap-2"
		>
			<div class="text-green-800 dark:text-green-300">
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
						{ign}
					{/if}
				</p>
				{#if leaderboard?.profile && entry.members?.length && entry.members.length > 1}
					<div class="xs:text-sm sm:text-md flex flex-row gap-1.5 text-start text-xs">
						{#each entry.members.slice(1, 3) ?? [] as member}
							<p>{member.ign}</p>
						{/each}
						{#if entry.members.length > 3}
							<p class="font-semibold">+{entry.members.length - 3}</p>
						{/if}
					</div>
				{:else}
					<div
						class="xs:text-sm sm:text-md inline overflow-hidden text-ellipsis whitespace-nowrap text-start text-xs"
					>
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
				>
					{leaderboard?.title}
				</div>
			{/if}
		</div>
	</div>
</a>
