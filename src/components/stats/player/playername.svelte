<script lang="ts">
	import { formatIgn } from '$lib/format';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Popover from '$ui/popover';

	const ctx = getStatsContext();
	const ign = $derived(ctx.ignMeta);
	const rank = $derived(ctx.rank);
	const plus = $derived(rank?.plus ?? undefined);
	const plusColor = $derived(rank?.plusColor);
	const members = $derived((ctx.selectedProfile?.members ?? []).filter((m) => m.active && m.uuid !== ctx.account.id));
</script>

<Popover.Mobile hasContent={members.length > 0}>
	{#snippet trigger()}
		<div class="rounded-md bg-card p-2" id="playerName">
			<h1 class="text-2xl md:text-3xl">
				{#if rank && plus}
					<span style="color: {rank.color};">{rank?.tag}</span><span style="color: {plusColor};">{plus}</span
					>&nbsp;{ign}
				{:else if rank}
					<span style="color: {rank.color};">{rank?.tag}</span>&nbsp;{ign}
				{:else}
					{ign}
				{/if}
			</h1>
		</div>
	{/snippet}
	{#if members?.length}
		<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
			{#each members ?? [] as member, i (member.uuid ?? i)}
				<a
					href={`/@${member.uuid}/${ctx.selectedProfile?.profileId}`}
					class="flex justify-between gap-4 rounded-sm p-2 text-xl font-semibold hover:bg-muted"
				>
					<span>{formatIgn(member.username, member.meta)}</span>
					<span class="font-normal">{member.farmingWeight?.toLocaleString()}</span>
				</a>
			{/each}
		</div>
	{/if}
</Popover.Mobile>
