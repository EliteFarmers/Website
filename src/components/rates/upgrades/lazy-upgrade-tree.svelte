<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import type { FortuneUpgrade, UpgradeInfo, UpgradeTreeNode } from 'farming-weight';
	import { untrack } from 'svelte';
	import UpgradeTree from './upgrade-tree.svelte';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: RatesItemPriceData;
		expandUpgrade: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
		defaultOpen?: boolean;
	}

	let { upgrade, items, expandUpgrade, costFn, applyUpgrade, defaultOpen = false }: Props = $props();

	let node = $state<UpgradeTreeNode | null>(null);
	let nodeKey = $state('');

	function getUpgradeKey(upgrade: FortuneUpgrade): string {
		const metaKey = upgrade.meta?.id ?? upgrade.meta?.key ?? '';
		return `${upgrade.category}|${upgrade.title}|${metaKey}|${upgrade.conflictKey ?? ''}`;
	}

	$effect(() => {
		const key = getUpgradeKey(upgrade);
		if (node && nodeKey === key) return;
		nodeKey = key;
		node = untrack(() => expandUpgrade(upgrade));
	});
</script>

{#if node}
	<UpgradeTree {node} {items} {costFn} {applyUpgrade} {defaultOpen} />
{:else}
	<p class="text-muted-foreground py-2 text-center text-sm italic">Loading upgrade path...</p>
{/if}
