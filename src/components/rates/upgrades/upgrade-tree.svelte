<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import type { FortuneUpgrade, UpgradeInfo, UpgradeTreeNode } from 'farming-weight';
	import UpgradeCostPer from './upgrade-cost-per.svelte';
	import UpgradeCost from './upgrade-cost.svelte';
	import UpgradeFortune from './upgrade-fortune.svelte';
	import UpgradeTitle from './upgrade-title.svelte';
	import UpgradeTree from './upgrade-tree.svelte';

	interface Props {
		node: UpgradeTreeNode;
		items?: RatesItemPriceData;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
	}

	let { node, items, costFn }: Props = $props();

	const cost = $derived(costFn ? costFn(node.upgrade, items) : 0);
</script>

<div class="border-muted flex flex-col gap-2 border-l-2 py-1 pl-4">
	<div class="flex items-center gap-4 text-sm">
		<UpgradeTitle upgrade={node.upgrade} {items} />
		<div class="text-muted-foreground flex items-center gap-4">
			<UpgradeFortune upgrade={node.upgrade} />
			<UpgradeCostPer upgrade={node.upgrade} totalCost={cost} />
			<UpgradeCost upgrade={node.upgrade} {items} totalCost={cost} />
		</div>
	</div>
	{#if node.children.length > 0}
		{#each node.children as child}
			<UpgradeTree node={child} {items} {costFn} />
		{/each}
	{/if}
</div>
