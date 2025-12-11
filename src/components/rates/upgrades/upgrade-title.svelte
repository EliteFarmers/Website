<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRequirements from '$comp/items/item-requirements.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import Button from '$ui/button/button.svelte';
	import * as Popover from '$ui/popover';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { UpgradeAction, UpgradeCategory, type FortuneUpgrade, type UpgradeTreeNode } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: RatesItemPriceData;
		expanded?: boolean;
		toggleExpanded?: () => void;
		expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
	}

	let { upgrade, items, expanded, toggleExpanded, expandUpgrade }: Props = $props();

	const itemData = $derived.by(() => {
		const item = upgrade.purchase;
		if (!item) return undefined;
		return items?.[item]?.item ?? undefined;
	});

	const hasNextUpgrades = $derived((expandUpgrade?.(upgrade).children.length ?? 0) > 0);
</script>

<div class="flex min-w-80 flex-1 flex-col items-start justify-center gap-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<ItemName name={upgrade.title} />
		{#if upgrade.wiki}
			<a href={upgrade.wiki} target="_blank" rel="noopener noreferrer" class="text-link">
				<Info size={16} />
			</a>
		{/if}
		{#if upgrade.api === false}
			<Popover.Mobile>
				{#snippet trigger()}
					<TriangleAlert size={16} class="text-completed" />
				{/snippet}
				<p class="max-w-sm text-sm">
					This fortune source is not available in the Hypixel API. Configure settings on this page to mark it
					as complete.
				</p>
			</Popover.Mobile>
		{/if}
	</p>
	<p class="text-sm">
		{#if upgrade.action === UpgradeAction.Apply && upgrade.onto?.name}
			<span>Apply {upgrade.category} on</span> <ItemName name={upgrade.onto.name} />
		{:else if upgrade.action === UpgradeAction.LevelUp && upgrade.onto?.name}
			<span>Level up {upgrade.category} on</span>
			<ItemName name={upgrade.onto.name} />
		{:else if upgrade.action === UpgradeAction.LevelUp}
			{#if upgrade.category === UpgradeCategory.Attribute}
				<span>Level up {upgrade.category}</span>
			{/if}
			<!-- {:else if upgrade.action === UpgradeAction.Recombobulate && upgrade.onto?.name}
      <span>Recombobulate</span> <ItemName name={upgrade.onto.name} /> -->
		{:else if upgrade.action === UpgradeAction.Purchase}
			<span>Purchase {upgrade.title}</span>
		{:else if upgrade.action === UpgradeAction.Consume}
			<span>Consume {upgrade.title}</span>
		{:else if upgrade.action === UpgradeAction.Upgrade && upgrade.onto?.name}
			<span>Upgrade</span> <ItemName name={upgrade.onto.name} />
		{/if}
	</p>
	{#if itemData}
		<ItemRequirements {itemData} />
	{/if}
	{#if upgrade.repeatable && upgrade.repeatable > 1}
		<p class="text-muted-foreground text-xs">
			This upgrade can be done <span class="font-bold">{upgrade.repeatable.toLocaleString()}</span> times!
		</p>
	{/if}
	{#if upgrade.optional}
		<p class="text-muted-foreground text-xs">Recommended for more profit despite lower fortune.</p>
	{/if}
	{#if upgrade.increase === 0 && upgrade.max && upgrade.max > 0}
		<p class="text-muted-foreground text-xs">Gives no fortune right away, but has later upgrades.</p>
	{/if}
	{#if hasNextUpgrades && toggleExpanded}
		<Button variant="link" size="sm" class="text-muted-foreground h-auto p-0" onclick={() => toggleExpanded()}>
			{#if expanded}
				<ChevronDown class="mr-1 h-3 w-3" /> Hide next upgrades
			{:else}
				<ChevronRight class="mr-1 h-3 w-3" /> Show next upgrades...
			{/if}
		</Button>
	{/if}
</div>
