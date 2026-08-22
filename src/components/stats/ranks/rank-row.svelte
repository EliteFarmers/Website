<script lang="ts">
	import LeaderboardRankLink from '$comp/leaderboards/leaderboard-rank-link.svelte';
	import { formatLeaderboardAmount } from '$lib/format';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { LbList, LbRanking } from './columns';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		original: LbRanking;
		extra?: LbList;
	}

	let { original: rank, extra: leaderboards, ...rest }: Props = $props();

	const ctx = getStatsContext();

	const lb = $derived.by(() => {
		if (!leaderboards) return undefined;
		return leaderboards.leaderboards?.[rank.id];
	});
</script>

<div
	{...rest}
	class="flex flex-1 flex-row rounded-md border-2 px-2 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
>
	<div class="flex h-20 w-full flex-row items-center justify-between gap-2 sm:h-16">
		<div class="flex flex-col justify-center">
			<span class="md:text-lg">{rank.title}{lb?.suffix ? ` ${lb.suffix}` : ''}</span>
			{#if rank.amount === 0}
				<span class="text-sm text-muted-foreground">No progress yet!</span>
			{:else}
				<span class="text-sm">{formatLeaderboardAmount(lb, rank.amount)}</span>
			{/if}
		</div>
		<LeaderboardRankLink
			class="group relative flex h-full flex-1 flex-row items-center justify-end gap-2 pr-2 sm:pr-8"
			category={rank.id}
			player={ctx.ign}
			profile={ctx.selectedProfile?.profileName}
			rank={rank.rank}
		>
			<span>
				<span class="mr-0.5 text-muted-foreground">#</span><span class="font-mono text-2xl">{rank.rank}</span>
			</span>
			<div
				class="absolute right-1 hidden text-muted-foreground group-hover:animate-bounce-horizontal group-hover:text-primary sm:block"
			>
				<ArrowRight size={18} />
			</div>
		</LeaderboardRankLink>
	</div>
</div>
