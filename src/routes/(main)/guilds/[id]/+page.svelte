<script lang="ts">
	import GuildsList from '$comp/guilds/guilds-table.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<GuildsList guilds={data.guilds} />
