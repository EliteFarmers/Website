<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { getItemsFromUpgrades } from '$lib/items';
	import { getItem } from '$lib/remote/items.remote';
	import type { Row } from '@tanstack/table-core';
	import { type FortuneUpgrade, type UpgradeInfo, type UpgradeTreeNode } from 'farming-weight';
	import UpgradeTree from './upgrade-tree.svelte';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: RatesItemPriceData;
		expandUpgrade: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
		row?: Row<FortuneUpgrade>;
	}

	let { upgrade, items, expandUpgrade, costFn, applyUpgrade, row }: Props = $props();

	let tree = $derived(expandUpgrade(upgrade));

	// Flatten tree to find needed items
	const flattenedUpgrades = $derived.by(() => {
		const upgrades: FortuneUpgrade[] = [];
		const traverse = (node: UpgradeTreeNode) => {
			upgrades.push(node.upgrade);
			node.children.forEach(traverse);
		};
		tree.children.forEach(traverse);
		return upgrades;
	});

	$effect(() => {
		if (tree.children.length === 0 && row?.getIsExpanded()) {
			row.toggleExpanded(false);
		}
	});

	$effect(() => {
		if (!items) return;

		const needed = getItemsFromUpgrades(flattenedUpgrades);
		const missing = needed.filter((id) => !items![id]);

		if (missing.length > 0) {
			Promise.all(missing.map((id) => getItem(id))).then((results) => {
				results.forEach((res, i) => {
					if (items) items[missing[i]] = res;
				});
			});
		}
	});

	function getUpgradeKey(upgrade: FortuneUpgrade, index: number): string {
		const metaKey = upgrade.meta?.id ?? upgrade.meta?.key ?? '';
		return `${upgrade.category}|${upgrade.title}|${metaKey}|${upgrade.conflictKey ?? ''}|${index}`;
	}
</script>

<div class="flex flex-col gap-2 p-2">
	{#if tree.children.length > 0}
		{#each tree.children as child, i (getUpgradeKey(child.upgrade, i))}
			<UpgradeTree node={child} {items} {costFn} {applyUpgrade} defaultOpen={tree.children.length === 1} />
		{/each}
	{:else}
		<p class="text-muted-foreground py-2 text-center text-sm italic">No further upgrades available in this path.</p>
	{/if}
</div>
