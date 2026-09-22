<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();

	const copper = $derived(ctx.member.current?.unparsed?.copper ?? 0);
	const analyzedMutations = $derived(
		Object.values(ctx.member.current?.memberData?.garden?.mutations ?? {}).filter((a) => a.analyzed).length
	);
</script>

<div class="flex w-fit flex-col gap-2 rounded-md bg-background p-3 text-foreground">
	<h3 class="text-lg leading-none font-semibold">Stats</h3>
	<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
		Copper • <span class="font-semibold">{copper.toLocaleString()}</span>
	</div>
	<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
		DNA Analysis Milestone • <span class="font-semibold">{ctx.member.current?.unparsed?.dnaMilestone ?? 0} </span>
	</div>
	<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
		Analyzed Mutations • <span class="font-semibold">{analyzedMutations}</span>
	</div>
</div>
