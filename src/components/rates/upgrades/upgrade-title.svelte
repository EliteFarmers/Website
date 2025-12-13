<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import Button from '$ui/button/button.svelte';
	import * as Popover from '$ui/popover';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { FortuneUpgrade, UpgradeTreeNode } from 'farming-weight';
	import UpgradeDescription from './upgrade-description.svelte';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: RatesItemPriceData;
		expanded?: boolean;
		toggleExpanded?: () => void;
		expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
	}

	let { upgrade, items, expanded, toggleExpanded, expandUpgrade }: Props = $props();

	const hasNextUpgrades = $derived((expandUpgrade?.(upgrade).children.length ?? 0) > 0);
</script>

<div class="flex h-full min-w-80 flex-1 flex-col items-start justify-center gap-1">
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
	<UpgradeDescription {upgrade} {items} />
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
