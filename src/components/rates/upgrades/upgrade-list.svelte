<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite.js';
	import type { FortuneUpgrade, UpgradeInfo } from 'farming-weight';
	import { getColumns } from './columns.js';
	import UpgradesTable from './data-table.svelte';

	interface Props {
		upgrades: FortuneUpgrade[];
		items?: RatesItemPriceData;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
	}

	let { upgrades, items, costFn }: Props = $props();

	const columns = $derived(getColumns(items, costFn));
</script>

<div class="w-full max-w-6xl py-2">
	<UpgradesTable data={upgrades} {columns} initialSorting={[{ id: 'costper', desc: false }]} />
</div>
