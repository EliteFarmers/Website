<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRequirements from '$comp/items/item-requirements.svelte';
	import ScrollingName from '$comp/items/scrolling-name.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { UpgradeAction, UpgradeCategory, type FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		items?: RatesItemPriceData;
	}

	let { upgrade, items }: Props = $props();

	const itemData = $derived.by(() => {
		const item = upgrade.purchase ?? upgrade.onto?.newSkyblockId;
		if (!item) return undefined;
		return items?.[item]?.item ?? undefined;
	});
</script>

<div class="flex flex-col items-start justify-center gap-1">
	<p class="flex max-w-80 min-w-0 flex-wrap items-baseline gap-x-1 text-sm">
		{#if upgrade.action === UpgradeAction.Apply && upgrade.onto?.name}
			<span class="shrink-0">Apply {upgrade.category} on</span>
			<ScrollingName class="min-w-0 flex-1" title={upgrade.onto.name}>
				<ItemName name={upgrade.onto.name} />
			</ScrollingName>
		{:else if upgrade.action === UpgradeAction.LevelUp && upgrade.onto?.name}
			<span class="shrink-0">Level up {upgrade.category} on</span>
			<ScrollingName class="min-w-0 flex-1" title={upgrade.onto.name}>
				<ItemName name={upgrade.onto.name} />
			</ScrollingName>
		{:else if upgrade.action === UpgradeAction.LevelUp}
			{#if upgrade.category === UpgradeCategory.Attribute}
				<span>Level up {upgrade.category}</span>
			{/if}
		{:else if upgrade.action === UpgradeAction.Purchase}
			<span class="shrink-0">Purchase</span>
			<ScrollingName class="min-w-0 flex-1" title={upgrade.title}>
				{upgrade.title}
			</ScrollingName>
		{:else if upgrade.action === UpgradeAction.Consume}
			<span class="shrink-0">Consume</span>
			<ScrollingName class="min-w-0 flex-1" title={upgrade.title}>
				{upgrade.title}
			</ScrollingName>
		{:else if upgrade.action === UpgradeAction.Upgrade && upgrade.onto?.name}
			<span class="shrink-0">Upgrade</span>
			<ScrollingName class="min-w-0 flex-1" title={upgrade.onto.name}>
				<ItemName name={upgrade.onto.name} />
			</ScrollingName>
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
	{#if upgrade.meta?.type === 'upgrade_group'}
		<p class="text-muted-foreground text-xs">
			<span class="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs leading-none">Set Upgrade</span>
			{#if upgrade.group?.warning}
				{upgrade.group.warning}
			{/if}
		</p>
	{/if}
	{#if upgrade.optional}
		<p class="text-muted-foreground text-xs">Recommended for more profit despite lower fortune.</p>
	{/if}
	{#if upgrade.increase === 0 && upgrade.max && upgrade.max > 0 && (upgrade.effects?.length ?? 0) === 0}
		{#if upgrade.stats}
			<p class="text-muted-foreground text-xs">Gives no fortune right away, but has later upgrades.</p>
		{:else}
			<p class="text-muted-foreground text-xs">Shown for completion!</p>
		{/if}
	{/if}
</div>
