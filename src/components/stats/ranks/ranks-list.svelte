<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte.js';
	import { getColumns } from './columns.js';
	import RanksTable from './rank-table.svelte';
	import RankRow from './rank-row.svelte';

	interface Props {
		leaderboards?: (typeof import('$lib/servercache').cache)['leaderboards'];
	}

	let { leaderboards }: Props = $props();

	const ctx = getStatsContext();
	const ranks = $derived(
		Object.entries(ctx.ranks)
			.filter(([, rank]) => rank.amount)
			.map(([id, rank]) => ({
				id,
				interval: (id.endsWith('-monthly') ? 'monthly' : 'none') as 'none' | 'monthly',
				...rank,
			}))
	);

	const columns = $derived(getColumns(leaderboards));
</script>

<div class="w-full max-w-4xl py-2">
	<RanksTable
		data={ranks}
		{columns}
		initialSorting={[{ id: 'rank', desc: false }]}
		row={RankRow}
		extra={leaderboards}
	/>
</div>
