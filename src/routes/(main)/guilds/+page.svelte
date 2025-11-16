<script lang="ts">
	import GuildsList from '$comp/guilds/guilds-list.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#if data.guilds?.guilds}
	<GuildsList guilds={data.guilds?.guilds} />
{:else}
	<p>No guilds found.</p>
{/if}
<pre>{JSON.stringify(data.guilds, null, 2)}</pre>
