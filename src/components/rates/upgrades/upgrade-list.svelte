<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite.js';
	import type { FortuneUpgrade, UpgradeInfo, UpgradeTreeNode } from 'farming-weight';
	import { getColumns } from './columns.js';
	import UpgradesTable from './data-table.svelte';
	import UpgradeTreeWrapper from './upgrade-tree-wrapper.svelte';

	interface Props {
		upgrades: FortuneUpgrade[];
		items?: RatesItemPriceData;
		version?: number;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
		expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
	}

	let { upgrades, items, version, costFn, applyUpgrade, expandUpgrade }: Props = $props();

	const columns = $derived(getColumns(items, costFn, applyUpgrade, expandUpgrade, version));

	const tableData = $derived.by(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = version;
		return [...upgrades];
	});
</script>

<div class="w-full max-w-6xl py-2">
	<UpgradesTable data={tableData} {columns} initialSorting={[{ id: 'costper', desc: false }]}>
		{#snippet renderSubComponent({ row })}
			{#if expandUpgrade}
				<UpgradeTreeWrapper upgrade={row.original} {items} {expandUpgrade} {costFn} {applyUpgrade} {row} />
			{/if}
		{/snippet}
	</UpgradesTable>
</div>
