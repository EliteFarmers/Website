<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button, Popover } from 'flowbite-svelte';
	import { slide } from 'svelte/transition';

	export let ign: string | null | undefined;
	export let rank: { color: string; tag: string; plus?: string; plusColor?: string } | undefined;
	export let members: components['schemas']['MemberDetailsDto'][] | undefined;
	export let profileId: string;

	$: plus = rank?.plus ?? undefined;
	$: plusColor = rank?.plusColor;
	$: activeMembers = members?.filter((m) => m?.active) ?? [];
</script>

<div class="grid col-span-1">
	<div class="p-2 mx-1 bg-gray-200 dark:bg-zinc-700 rounded-md" id="playerName">
		<h1 class="text-3xl">
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
		<Popover
			triggeredBy="#playerName"
			class="text-sm font-light z-10 bg-gray-200 dark:bg-zinc-700"
			placement="bottom"
			color="none"
			border={false}
			offset={0}
			arrow={false}
			transition={slide}
		>
			<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
				{#each activeMembers ?? [] as member}
					<a
						href={`/@${member.uuid}/${profileId}`}
						class="p-2 text-xl font-semibold flex gap-4 justify-between text-gray-600 hover:text-gray-900 dark:text-zinc-200 dark:hover:text-zinc-400"
					>
						<span>{member.username}</span>
						<span class="font-normal">{member.farmingWeight?.toLocaleString()}</span>
					</a>
				{/each}
			</div>
		</Popover>
	{/if}
</div>
