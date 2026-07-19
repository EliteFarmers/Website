<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite.js';
	import type { SortingState } from '@tanstack/table-core';
	import type { FortuneUpgrade, UpgradeInfo, UpgradeRateImpact, UpgradeTreeNode } from 'farming-weight';
	import { untrack } from 'svelte';
	import { getColumns } from './columns.js';
	import UpgradesTable from './data-table.svelte';
	import UpgradeTreeWrapper from './upgrade-tree-wrapper.svelte';

	type AnyUpgradeRateImpact = UpgradeRateImpact<unknown, unknown>;

	interface Props {
		upgrades: FortuneUpgrade[];
		items?: RatesItemPriceData;
		version?: number | string;
		pathVersion?: number | string;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
		expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
		hasUpgradePath?: (upgrade: FortuneUpgrade) => boolean;
		rateImpactFn?: (upgrade: FortuneUpgrade) => AnyUpgradeRateImpact | undefined;
		rateImpactUnavailableLabel?: string;
		costPerValueFn?: (upgrade: FortuneUpgrade) => number;
		costPerHeader?: string;
		initialSorting?: SortingState;
		referenceOnlyPrices?: boolean;
	}

	let {
		upgrades,
		items,
		version,
		pathVersion = version,
		costFn,
		applyUpgrade,
		expandUpgrade,
		hasUpgradePath,
		rateImpactFn,
		rateImpactUnavailableLabel,
		costPerValueFn,
		costPerHeader,
		initialSorting,
		referenceOnlyPrices = false,
	}: Props = $props();

	let hasPathCache = {} as Record<string, boolean>;

	$effect(() => {
		void upgrades;
		void pathVersion;
		hasPathCache = {};
	});

	function getUpgradeKey(upgrade: FortuneUpgrade) {
		return (
			upgrade.conflictKey ??
			`${upgrade.title}::${upgrade.action}::${upgrade.meta?.type ?? ''}::${upgrade.meta?.key ?? ''}`
		);
	}

	function canExpandUpgrade(upgrade: FortuneUpgrade) {
		if (!expandUpgrade) return false;
		if (!hasUpgradePath) return false;

		const key = `${pathVersion ?? 0}::${getUpgradeKey(upgrade)}`;
		const cached = hasPathCache[key];
		if (cached !== undefined) return cached;

		const canExpand = untrack(() => hasUpgradePath(upgrade));
		hasPathCache[key] = canExpand;
		return canExpand;
	}

	const columns = $derived(
		getColumns(
			items,
			costFn,
			applyUpgrade,
			expandUpgrade,
			canExpandUpgrade,
			rateImpactFn,
			rateImpactUnavailableLabel,
			version,
			costPerValueFn,
			costPerHeader,
			referenceOnlyPrices
		)
	);

	const tableData = $derived.by(() => {
		if (version) {
			// Just to trigger reactivity when version changes
			return [...upgrades];
		}
		return [...upgrades];
	});
</script>

<div class="w-full max-w-6xl py-2">
	<UpgradesTable data={tableData} {columns} initialSorting={initialSorting ?? [{ id: 'costper', desc: false }]}>
		{#snippet renderSubComponent({ row })}
			{#if expandUpgrade}
				<UpgradeTreeWrapper
					upgrade={row.original}
					{items}
					{expandUpgrade}
					{costFn}
					{applyUpgrade}
					{row}
					{referenceOnlyPrices}
				/>
			{/if}
		{/snippet}
	</UpgradesTable>
</div>
