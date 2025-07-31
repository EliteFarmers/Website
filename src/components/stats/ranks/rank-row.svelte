<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { LbList, LbRanking } from './columns';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		original: LbRanking;
		extra?: LbList;
	}

	let { original: rank, extra: leaderboards, ...rest }: Props = $props();

	const ctx = getStatsContext();

	const lb = $derived.by(() => {
		if (!leaderboards) return null;
		return leaderboards.leaderboards?.[rank.id];
	});
</script>

<div
	{...rest}
	class="hover:bg-muted/50 data-[state=selected]:bg-muted flex flex-1 flex-row rounded-md border-2 px-2 transition-colors"
>
	<div class="flex h-20 w-full flex-row items-center justify-between gap-2 sm:h-16">
		<div class="flex flex-col justify-center">
			<span class="md:text-lg">{rank.title}{lb?.suffix ? ` ${lb.suffix}` : ''}</span>
			{#if rank.amount === 0}
				<span class="text-muted-foreground text-sm">No progress yet!</span>
			{:else}
				<span class="text-sm">{rank.amount.toLocaleString()}</span>
			{/if}
		</div>
		<a
			class="group relative flex h-full flex-1 flex-row items-center justify-end gap-2 pr-2 sm:pr-8"
			href="/leaderboard/{rank.id}/{ctx.ign}-{ctx.selectedProfile?.profileName ?? ''}"
		>
			<span>
				<span class="text-muted-foreground mr-0.5">#</span><span class="font-mono text-2xl">{rank.rank}</span>
			</span>
			<div
				class="text-muted-foreground group-hover:text-primary group-hover:animate-bounce-horizontal absolute right-1 hidden sm:block"
			>
				<ArrowRight size={18} />
			</div>
		</a>
	</div>
</div>
