<script lang="ts">
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import type { MemberData } from '$lib/skyblock';

	export let ign: string;
	export let rank: { color: string; tag: string; plus?: string; plusColor?: string } | undefined;
	export let members: MemberData[] | undefined;
	export let profileId: string;

	const plus = rank?.plus ?? undefined;
	const plusColor = rank?.plusColor;
</script>

<Button class="bg-zinc-200 dark:bg-zinc-700" aria-label="Other players in profile">
	{#if rank && plus}
		<span style="color: {rank.color};">{rank?.tag}</span><span style="color: {plusColor};">{plus}</span>&nbsp;{ign}
	{:else if rank}
		<span style="color: {rank.color};">{rank?.tag}</span>&nbsp;{ign}
	{:else}
		<h1>{ign}</h1>
	{/if}
</Button>
{#if members && members.length > 0}
	<Dropdown>
		{#each members ?? [] as member}
			<DropdownItem>
				<a
					href={`/stats/${member.ign ?? member.uuid}/${profileId}`}
					class="flex flex-row gap-2 align-middle items-start"
					data-sveltekit-reload
				>
					<img
						class="w-6 h-6"
						src="https://mc-heads.net/avatar/{member.uuid}/16"
						alt="{member.ign} player head"
					/>
					<span class="">{member.ign}</span>
				</a>
			</DropdownItem>
		{/each}
	</Dropdown>
{/if}
