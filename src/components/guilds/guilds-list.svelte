<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api/index.js';
	import { getColumns } from './columns.js';
	import GuildsTable from './guilds-table.svelte';

	interface Props {
		guilds: HypixelGuildDetailsDto[];
	}

	let { guilds }: Props = $props();

	const columns = $derived(getColumns());
</script>

<div class="w-full max-w-4xl py-2">
	<GuildsTable data={guilds} {columns} initialSorting={[{ id: 'Member Count', desc: true }]} />
</div>
