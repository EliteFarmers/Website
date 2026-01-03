<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { Button, buttonVariants } from '$ui/button';
	import * as Collapsible from '$ui/collapsible';
	import * as Popover from '$ui/popover';
	import Check from '@lucide/svelte/icons/check';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { FortuneUpgrade, UpgradeInfo, UpgradeTreeNode } from 'farming-weight';
	import UpgradeCost from './upgrade-cost.svelte';
	import UpgradeDescription from './upgrade-description.svelte';
	import UpgradeFortune from './upgrade-fortune.svelte';
	import UpgradeTree from './upgrade-tree.svelte';

	interface Props {
		node: UpgradeTreeNode;
		items?: RatesItemPriceData;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
		defaultOpen?: boolean;
	}

	let { node, items, costFn, applyUpgrade, defaultOpen = false }: Props = $props();

	let isOpen = $derived(defaultOpen);
	const upgrade = $derived(node.upgrade);
	const cost = $derived(costFn ? costFn(upgrade, items) : 0);
	const fortuneForCost = $derived(
		(upgrade.increase > 0 ? upgrade.increase : ((upgrade.stats ? upgrade.max : 0) ?? 0)) || 0
	);

	// Calculate copper and bits costs
	const copperTotal = $derived((upgrade.cost?.copper ?? 0) + (upgrade.cost?.applyCost?.copper ?? 0));
	const bitsTotal = $derived((upgrade.cost?.bits ?? 0) + (upgrade.cost?.applyCost?.bits ?? 0));
	const copperPerFF = $derived(fortuneForCost > 0 && copperTotal > 0 ? Math.round(copperTotal / fortuneForCost) : 0);
	const bitsPerFF = $derived(fortuneForCost > 0 && bitsTotal > 0 ? Math.round(bitsTotal / fortuneForCost) : 0);

	// Use copper/bits if no coin cost, otherwise use coins
	const displayTotal = $derived.by(() => {
		if (cost > 0) return cost;
		if (copperTotal > 0) return copperTotal;
		if (bitsTotal > 0) return bitsTotal;
		return 0;
	});

	const displayPerFF = $derived.by(() => {
		if (cost > 0 && fortuneForCost > 0) return Math.round(cost / fortuneForCost);
		if (copperPerFF > 0) return copperPerFF;
		if (bitsPerFF > 0) return bitsPerFF;
		return 0;
	});

	const displayUnit = $derived.by(() => {
		if (cost > 0) return 'coins';
		if (copperTotal > 0) return ' copper';
		if (bitsTotal > 0) return ' bits';
		return '';
	});

	const formatCompact = (num: number) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
	const hasChildren = $derived(node.children.length > 0);
	const hasDetails = $derived(
		cost > 0 || (upgrade.cost?.items && Object.keys(upgrade.cost.items).length > 0) || upgrade.action !== undefined
	);
	const isExpandable = $derived(hasChildren || hasDetails);

	function getUpgradeKey(upgrade: FortuneUpgrade, index: number): string {
		const metaKey = upgrade.meta?.id ?? upgrade.meta?.key ?? '';
		return `${upgrade.category}|${upgrade.title}|${metaKey}|${upgrade.conflictKey ?? ''}|${index}`;
	}
</script>

<Collapsible.Root
	bind:open={isOpen}
	class="upgrade-tree-root bg-card/20 w-full rounded-lg border"
	data-expanded={isOpen}
>
	<div
		class="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-2 transition-colors hover:bg-white/5 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_6.5rem_6.5rem] sm:gap-y-0"
	>
		{#if isExpandable}
			<Collapsible.Trigger
				class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-6 w-6 shrink-0 p-0' })}
			>
				<ChevronRight class="h-4 w-4 transition-transform duration-200 {isOpen ? 'rotate-90' : ''}" />
			</Collapsible.Trigger>
		{:else}
			<div class="w-6 shrink-0"></div>
		{/if}

		<div class="flex min-w-0 flex-row items-center gap-2">
			<div class="bg-muted/20 flex h-8 w-8 shrink-0 items-center justify-center rounded border">
				{#if upgrade.purchase}
					<ItemRender skyblockId={upgrade.purchase} class="size-6" />
				{:else if upgrade.onto?.newSkyblockId}
					<ItemRender skyblockId={upgrade.onto.newSkyblockId} class="size-6" />
				{:else if upgrade.cost?.items && Object.keys(upgrade.cost.items).length > 0}
					<ItemRender skyblockId={Object.keys(upgrade.cost.items)[0]} class="size-6" />
				{:else}
					<span class="text-muted-foreground text-xs font-bold">+</span>
				{/if}
			</div>

			<div class="min-w-0">
				<div class="text-sm leading-tight font-semibold wrap-break-word sm:truncate">
					<ItemName name={upgrade.title} />
				</div>
			</div>

			{#if upgrade.wiki}
				<a href={upgrade.wiki} target="_blank" rel="noopener noreferrer" class="text-link p-1">
					<Info size={14} />
				</a>
			{/if}
		</div>

		<div class="flex shrink-0 items-center gap-1">
			{#if applyUpgrade}
				<Button size="sm" variant="ghost" class="h-7 px-2" onclick={() => applyUpgrade(upgrade)}>
					<Check size={14} class="mr-1" />
					Done
				</Button>
			{/if}
		</div>

		<div class="hidden flex-row items-center gap-1 sm:flex">
			<UpgradeFortune {upgrade} class="w-fit" />
			{#if upgrade.api === false}
				<Popover.Mobile>
					{#snippet trigger()}
						<TriangleAlert size={14} class="text-completed" />
					{/snippet}
					<p class="max-w-sm text-sm">
						This fortune source is not available in the Hypixel API. Configure settings on this page to mark
						it as complete.
					</p>
				</Popover.Mobile>
			{/if}
		</div>

		<div class="col-start-2 row-start-2 flex flex-row items-start gap-1 sm:hidden">
			<UpgradeFortune {upgrade} class="w-fit" />
			{#if upgrade.api === false}
				<Popover.Mobile>
					{#snippet trigger()}
						<TriangleAlert size={14} class="text-completed" />
					{/snippet}
					<p class="max-w-sm text-sm">
						This fortune source is not available in the Hypixel API. Configure settings on this page to mark
						it as complete.
					</p>
				</Popover.Mobile>
			{/if}
		</div>

		<div class="col-start-3 row-start-2 text-right tabular-nums sm:hidden">
			{#if displayPerFF > 0}
				<div>
					<span class="dark:text-completed font-semibold">{formatCompact(displayPerFF)}</span>
					<span class="text-muted-foreground text-sm">{displayUnit} per</span>
				</div>
			{:else}
				<div class="text-muted-foreground text-sm">N/A</div>
			{/if}
			{#if displayTotal > 0}
				<div>
					<span class="dark:text-completed font-semibold">{formatCompact(displayTotal)}</span>
					<span class="text-muted-foreground text-sm">{displayUnit}</span>
				</div>
			{:else}
				<div class="text-muted-foreground text-sm">N/A</div>
			{/if}
		</div>

		<div class="hidden text-right tabular-nums sm:block">
			{#if displayPerFF > 0}
				<span class="dark:text-completed font-semibold">{formatCompact(displayPerFF)}</span>
				<span class="text-muted-foreground text-sm">{displayUnit} per</span>
			{:else}
				<span class="text-muted-foreground text-sm">N/A</span>
			{/if}
		</div>

		<div class="hidden text-right tabular-nums sm:block">
			{#if displayTotal > 0}
				<span class="dark:text-completed font-semibold">{formatCompact(displayTotal)}</span>
				<span class="text-muted-foreground text-sm">{displayUnit}</span>
			{:else}
				<span class="text-muted-foreground text-sm">N/A</span>
			{/if}
		</div>
	</div>

	{#if isExpandable}
		<Collapsible.Content>
			<div class="flex flex-col border-t">
				{#if hasDetails}
					<div
						class="flex w-full min-w-0 flex-col gap-3 p-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
					>
						<div class="min-w-0">
							<UpgradeDescription {upgrade} {items} />
						</div>
						<UpgradeCost {upgrade} {items} totalCost={cost} class="min-w-0" />
					</div>
				{/if}

				{#if hasChildren}
					<div class="flex flex-col gap-2 pr-0 pb-0 pl-2" class:pt-2={!hasDetails}>
						{#each node.children as child, i (getUpgradeKey(child.upgrade, i))}
							<UpgradeTree node={child} {items} {costFn} {applyUpgrade} />
						{/each}
					</div>
				{/if}
			</div>
		</Collapsible.Content>
	{/if}
</Collapsible.Root>

<style>
	:global(.upgrade-tree-root .upgrade-tree-root) {
		border-right-width: 0;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	:global(.upgrade-tree-root .upgrade-tree-root[data-expanded='true']) {
		border-bottom-width: 0;
		border-bottom-left-radius: 0;
	}
</style>
