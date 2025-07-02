<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte.js';
	import { getColumns } from './columns.js';
	import RanksTable from './data-table.svelte';

	interface Props {
		leaderboards?: (typeof import('$lib/servercache').cache)['leaderboards'];
	}

	let { leaderboards }: Props = $props();

	const ctx = getStatsContext();
	const ranks = $derived(
		Object.entries(ctx.ranks).map(([id, rank]) => ({
			id,
			...rank,
		}))
	);

	const columns = $derived(getColumns(ranks, leaderboards));
</script>

<div class="w-full max-w-6xl py-2">
	<RanksTable data={ranks} {columns} initialSorting={[{ id: 'rank', desc: false }]} />
</div>
