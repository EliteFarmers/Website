<script lang="ts">
	import { page } from '$app/stores';
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';

	export let ign: string | null | undefined;
	export let rank: { color: string; tag: string; plus?: string; plusColor?: string } | undefined;
	export let members: components['schemas']['MemberDetailsDto'][] | undefined;
	export let profileId: string;

	$: ign = ign ?? $page.params.id;
	$: plus = rank?.plus ?? undefined;
	$: plusColor = rank?.plusColor;
	$: activeMembers = members?.filter((m) => m?.active) ?? [];
</script>

<Popover.Mobile hasContent={activeMembers.length > 0}>
	<div slot="trigger" class="p-2 bg-primary-foreground rounded-md" id="playerName">
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
	{#if activeMembers.length > 0}
		<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
			{#each activeMembers ?? [] as member}
				<a
					href={`/@${member.uuid}/${profileId}`}
					class="p-2 text-xl font-semibold flex gap-4 justify-between hover:bg-muted rounded-sm"
				>
					<span>{member.username}</span>
					<span class="font-normal">{member.farmingWeight?.toLocaleString()}</span>
				</a>
			{/each}
		</div>
	{/if}
</Popover.Mobile>
