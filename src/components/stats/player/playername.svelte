<script lang="ts">
	import Dropdown from '$comp/generic/dropdown.svelte';
	import type { components } from '$lib/eliteapi/api';

	export let ign: string | null | undefined;
	export let rank: { color: string; tag: string; plus?: string; plusColor?: string } | undefined;
	export let members: components['schemas']['MemberDetailsDto'][] | undefined;
	export let profileId: string;

	const plus = rank?.plus ?? undefined;
	const plusColor = rank?.plusColor;
</script>

<Dropdown hasItems={(members ?? []).length > 0}>
	<h1 slot="top" class="text-body-xl">
		{#if rank && plus}
			<span style="color: {rank.color};">{rank?.tag}</span><span style="color: {plusColor};">{plus}</span
			>&nbsp;{ign}
		{:else if rank}
			<span style="color: {rank.color};">{rank?.tag}</span>&nbsp;{ign}
		{:else}
			{ign}
		{/if}
	</h1>
	<div slot="rest" class="grid col-span-1">
		{#each members?.filter(m => m?.active) ?? [] as member}
			<a
				data-sveltekit-reload
				href={`/stats/${member.username ?? member.uuid}/${profileId}`}
				class="p-1 text-body text-gray-600 hover:text-gray-900 dark:text-zinc-200 dark:hover:text-zinc-400"
				>{member.username}</a
			>
		{/each}
	</div>
</Dropdown>
