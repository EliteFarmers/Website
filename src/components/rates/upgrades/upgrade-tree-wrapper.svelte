<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { getItemsFromUpgrades } from '$lib/items';
	import { getItem } from '$lib/remote/items.remote';
	import type { Row } from '@tanstack/table-core';
	import type { FortuneUpgrade, UpgradeInfo, UpgradeTreeNode } from 'farming-weight';
	import UpgradeTree from './upgrade-tree.svelte';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: RatesItemPriceData;
		expandUpgrade: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		row?: Row<FortuneUpgrade>;
	}

	let { upgrade, items, expandUpgrade, costFn, row }: Props = $props();

	let tree = $derived(expandUpgrade(upgrade));

	$effect(() => {
		if (tree.children.length === 0 && row?.getIsExpanded()) {
			row.toggleExpanded(false);
		}
	});

	$effect(() => {
		if (!items) return;

		const upgrades: FortuneUpgrade[] = [];
		const traverse = (node: UpgradeTreeNode) => {
			upgrades.push(node.upgrade);
			node.children.forEach(traverse);
		};
		tree.children.forEach(traverse);

		const needed = getItemsFromUpgrades(upgrades);
		const missing = needed.filter((id) => !items![id]);

		if (missing.length > 0) {
			Promise.all(missing.map((id) => getItem(id))).then((results) => {
				results.forEach((res, i) => {
					if (items) items[missing[i]] = res;
				});
			});
		}
	});
</script>

{#if tree.children.length > 0}
	<div class="p-4">
		<h4 class="mb-2 font-semibold">Future Upgrades</h4>
		{#each tree.children as child, i (i)}
			<UpgradeTree node={child} {items} {costFn} />
		{/each}
	</div>
{/if}
