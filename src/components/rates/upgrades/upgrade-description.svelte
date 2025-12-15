<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRequirements from '$comp/items/item-requirements.svelte';
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
</div>
