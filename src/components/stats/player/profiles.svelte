<script lang="ts">
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';

	export let ign: string;
	export let selected: { id: string; name: string };
	export let profiles: { id: string; name: string }[];
</script>

<Button>
	{selected.name}
</Button>
{#if profiles.length > 0}
	<Dropdown>
		{#each profiles ?? [] as pId}
			<DropdownItem>
				<a
					href={`/stats/${ign}/${pId.name}`}
					data-sveltekit-reload
					class="p-1 text-body text-gray-600 hover:text-gray-900 dark:text-zinc-200 dark:hover:text-zinc-400"
					>{pId.name}</a
				>
			</DropdownItem>
		{/each}
	</Dropdown>
{/if}
