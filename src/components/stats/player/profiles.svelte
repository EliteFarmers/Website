<script lang="ts">
	import Dropdown from '$comp/generic/dropdown.svelte';

	export let ign: string;
	export let selected: { id: string; name: string };
	export let profiles: { id: string; name: string }[];
</script>

<Dropdown hasItems={profiles.length > 0}>
	<h1 slot="top">{selected.name}</h1>
	<div slot="rest" class="grid col-span-1">
		{#each profiles ?? [] as pId}
			<a
				data-sveltekit-reload
				href={`/stats/${ign}/${pId.name}`}
				class="p-1 text-body text-gray-600 hover:text-gray-900 dark:text-zinc-200 dark:hover:text-zinc-400"
				>{pId.name}</a
			>
		{/each}
	</div>
</Dropdown>
