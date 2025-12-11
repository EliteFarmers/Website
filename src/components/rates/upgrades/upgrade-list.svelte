<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite.js';
	import type { FortuneUpgrade, UpgradeInfo } from 'farming-weight';
	import { getColumns } from './columns.js';
	import UpgradesTable from './data-table.svelte';

	interface Props {
		upgrades: FortuneUpgrade[];
		items?: RatesItemPriceData;
		version?: number;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
	}

	let { upgrades, items, version, costFn, applyUpgrade }: Props = $props();

	const columns = $derived(
		version ? getColumns(items, costFn, applyUpgrade) : getColumns(items, costFn, applyUpgrade)
	);

	const tableData = $derived.by(() => {
		if (version) {
			return [...upgrades];
		}
		return upgrades;
	});
</script>

<div class="w-full max-w-6xl py-2">
	<UpgradesTable data={tableData} {columns} initialSorting={[{ id: 'costper', desc: false }]} />
</div>
