<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte.js';
	import { getColumns } from './columns.js';
	import RankRow from './rank-row.svelte';
	import RanksTable from './rank-table.svelte';

	interface Props {
		leaderboards?: (typeof import('$lib/servercache').cache)['leaderboards'];
	}

	let { leaderboards }: Props = $props();

	const ctx = getStatsContext();
	const ranks = $derived(
		Object.entries(ctx.allRanks)
			.filter(([, rank]) => rank.amount)
			.map(([id, rank]) => ({
				id,
				interval: (id.endsWith('-monthly') ? 'monthly' : id.endsWith('-weekly') ? 'weekly' : 'none') as
					| 'none'
					| 'monthly'
					| 'weekly',
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
