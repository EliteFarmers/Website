<script lang="ts">
	import { page } from '$app/stores';
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';

	interface Props {
		ign: string | null | undefined;
		rank: { color: string; tag: string; plus?: string; plusColor?: string } | undefined;
		members: components['schemas']['MemberDetailsDto'][] | undefined;
		profileId: string;
	}

	let { ign = $bindable(), rank, members, profileId }: Props = $props();

	$effect.pre(() => {
		ign = ign ?? $page.params.id;
	});
	let plus = $derived(rank?.plus ?? undefined);
	let plusColor = $derived(rank?.plusColor);
	let activeMembers = $derived(members?.filter((m) => m?.active) ?? []);
</script>

<Popover.Mobile hasContent={activeMembers.length > 0}>
	{#snippet trigger()}
		<div class="rounded-md bg-primary-foreground p-2" id="playerName">
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
	{#if activeMembers.length > 0}
		<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
			{#each activeMembers ?? [] as member}
				<a
					href={`/@${member.uuid}/${profileId}`}
					class="flex justify-between gap-4 rounded-sm p-2 text-xl font-semibold hover:bg-muted"
				>
					<span>{member.username}</span>
					<span class="font-normal">{member.farmingWeight?.toLocaleString()}</span>
				</a>
			{/each}
		</div>
	{/if}
</Popover.Mobile>
