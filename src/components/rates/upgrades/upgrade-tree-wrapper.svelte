<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { getItemsFromUpgrades } from '$lib/items';
	import { getItem } from '$lib/remote/items.remote';
	import type { Row } from '@tanstack/table-core';
	import { type FortuneUpgrade, type UpgradeInfo, type UpgradeTreeNode } from 'farming-weight';
	import { untrack } from 'svelte';
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

	let tree = $state<UpgradeTreeNode | null>(null);
	let treeKey = $state('');

	function flattenTree(node: UpgradeTreeNode): FortuneUpgrade[] {
		const upgrades: FortuneUpgrade[] = [];
		const traverse = (current: UpgradeTreeNode) => {
			upgrades.push(current.upgrade);
			current.children.forEach(traverse);
		};
		node.children.forEach(traverse);
		return upgrades;
	}

	$effect(() => {
		const key = getUpgradeKey(upgrade, 0);
		if (tree && treeKey === key) return;
		treeKey = key;
		tree = untrack(() => expandUpgrade(upgrade));
	});

	$effect(() => {
		if (tree && tree.children.length === 0 && row?.getIsExpanded()) {
			row.toggleExpanded(false);
		}
	});

	$effect(() => {
		if (!items || !tree) return;

		const needed = getItemsFromUpgrades(flattenTree(tree));
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
	{#if !tree}
		<p class="text-muted-foreground py-2 text-center text-sm italic">Loading upgrade path...</p>
	{:else if tree.children.length > 0}
		{#each tree.children as child, i (getUpgradeKey(child.upgrade, i))}
			<UpgradeTree node={child} {items} {costFn} {applyUpgrade} defaultOpen={tree.children.length === 1} />
		{/each}
	{:else}
		<p class="text-muted-foreground py-2 text-center text-sm italic">No further upgrades available in this path.</p>
	{/if}
</div>
