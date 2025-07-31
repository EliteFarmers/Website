<script lang="ts">
	import { SKYBLOCK_LEVEL_COLORS } from '$lib/constants/levels';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Popover from '$ui/popover';

	const ctx = getStatsContext();
	const xp = $derived(ctx.member.skyblockXp ?? 0);
	const rank = $derived(ctx.ranks?.skyblockxp?.rank ?? -1);

	let [, color] = $derived(Object.entries(SKYBLOCK_LEVEL_COLORS).find(([key]) => +key > xp / 100) ?? []);
</script>

<Popover.Mobile
	triggerRootClass="relative flex max-w-fit flex-row items-center justify-between gap-1 border rounded-md py-1.5 md:py-2 px-3 text-lg"
>
	{#snippet trigger()}
		<div>
			{#if rank !== -1}
				<a
					href="/leaderboard/skyblockxp/{ctx.ign}-{ctx.member.profileName}"
					class="bg-card hover:bg-muted rounded-md px-1.5"
				>
					<span class="xs:text-md text-sm sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
						>{rank}</span
					>
				</a>
			{/if}
			<span class="px-1 font-mono text-xl font-bold md:text-2xl" style="color: {color};"
				>{Math.floor(xp / 100)}</span
			>
		</div>
	{/snippet}
	<div class="px-4">
		<div class="text-center text-lg">Skyblock&nbsp;Level</div>
		<div class="text-center text-lg font-semibold">{xp} XP</div>
	</div>
</Popover.Mobile>
