<script lang="ts">
	import type { LeaderboardEntry } from '$lib/api/elite';
	import type { LeaderboardInfo } from '$lib/constants/leaderboards';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import Entry from './entry.svelte';

	interface Props {
		entries: LeaderboardEntry[];
		leaderboard?: LeaderboardInfo;
		offset?: number;
		showLeaderboardName?: boolean;
		class?: string;
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
		entries,
		leaderboard,
		offset = 1,
		showLeaderboardName = false,
		class: className = '',
		namePrefix,
	}: Props = $props();

	const splitIndex = $derived(Math.ceil(entries.length / 2));
	const firstHalf = $derived(entries.slice(0, splitIndex));
	const secondHalf = $derived(entries.slice(splitIndex));

	function getKey(entry: LeaderboardEntry, index: number): string {
		const id = entry.uuid ?? entry.members?.[0]?.uuid ?? entry.ign ?? entry.profile;
		return `${id ?? 'entry'}-${index}`;
	}
</script>

<div
	data-sveltekit-preload-data="tap"
	class={cn('flex flex-col justify-center gap-2 rounded-lg align-middle lg:flex-row', className)}
>
	<div class="flex w-full flex-col items-center gap-2 lg:items-end">
		{#each firstHalf as entry, index (getKey(entry, index))}
			<Entry rank={index + offset} {entry} {leaderboard} {namePrefix} {showLeaderboardName} />
		{/each}
	</div>
	<div class="flex w-full flex-col items-center gap-2 lg:items-start">
		{#each secondHalf as entry, index (getKey(entry, index + firstHalf.length))}
			<Entry rank={index + firstHalf.length + offset} {entry} {leaderboard} {namePrefix} {showLeaderboardName} />
		{/each}
	</div>
</div>
