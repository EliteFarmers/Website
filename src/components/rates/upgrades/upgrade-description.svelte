<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import ItemRequirements from '$comp/items/item-requirements.svelte';
	import ScrollingName from '$comp/items/scrolling-name.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import {
		FARMING_PET_ITEMS,
		UpgradeAction,
		UpgradeCategory,
		UpgradeRecommendationKind,
		type FortuneUpgrade,
	} from 'farming-weight';

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
	const requiredPetItem = $derived(
		upgrade.group?.kind === 'pet-purchase'
			? upgrade.groupedUpgrades?.find((member) => member.meta?.type === 'pet_item')
			: undefined
	);
	const requiredPetItemId = $derived(requiredPetItem?.meta?.id);
	const requiredPetItemName = $derived(
		requiredPetItemId
			? (FARMING_PET_ITEMS[requiredPetItemId]?.name ??
					items?.[requiredPetItemId]?.item?.name ??
					requiredPetItemId)
			: undefined
	);
	const isPetPurchaseGroup = $derived(upgrade.group?.kind === 'pet-purchase');
	const petSetupLabel = $derived.by(() => {
		const phases = upgrade.meta?.phases ?? [];
		if (phases.length === 0) return 'Pet setup';
		const names = phases.map((phase) => `${phase[0]?.toUpperCase()}${phase.slice(1)}`);
		return `${names.join(' + ')} setup`;
	});
</script>

<div class="flex flex-col items-start justify-center gap-1">
	{#if !isPetPurchaseGroup}
		<p class="flex max-w-80 min-w-0 flex-wrap items-baseline gap-x-1 text-sm">
			{#if upgrade.action === UpgradeAction.Apply && upgrade.onto?.name}
				{#if upgrade.meta?.type === 'pet_item'}
					<span class="shrink-0">Apply on</span>
				{:else}
					<span class="shrink-0">Apply {upgrade.category} on</span>
				{/if}
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
	{/if}
	{#if itemData}
		<ItemRequirements {itemData} />
	{/if}
	{#if upgrade.repeatable && upgrade.repeatable > 1}
		<p class="text-xs text-muted-foreground">
			This upgrade can be done <span class="font-bold">{upgrade.repeatable.toLocaleString()}</span> times!
		</p>
	{/if}
	{#if upgrade.meta?.type === 'pet_item'}
		<p class="text-xs text-muted-foreground">Replaces the held item on this pet everywhere the same pet is used.</p>
	{/if}
	{#if isPetPurchaseGroup}
		<p class="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
			<span class="rounded bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground">
				{petSetupLabel}
			</span>
			{#if requiredPetItemId && requiredPetItemName}
				<span>with</span>
				<span class="inline-flex min-w-0 items-center gap-0.5 font-medium text-foreground">
					<ItemRender skyblockId={requiredPetItemId} class="size-4 shrink-0" />
					<ItemName name={requiredPetItemName} />
				</span>
			{/if}
		</p>
	{:else if upgrade.meta?.type === 'upgrade_group'}
		<p class="text-xs text-muted-foreground">
			<span class="rounded bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground">
				{upgrade.group?.kind === 'loadout' ? 'Loadout Upgrade' : 'Set Upgrade'}
			</span>
			{#if upgrade.group?.warning}
				{upgrade.group.warning}
			{/if}
		</p>
	{/if}
	{#if upgrade.recommendation}
		<p class="text-xs text-muted-foreground">
			<span class="rounded bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground">
				{upgrade.recommendation.label}
			</span>
			{#if upgrade.recommendation.kind === UpgradeRecommendationKind.Progression}
				{upgrade.recommendation.description ?? 'Recommended for progression, not just immediate rate.'}
			{:else if upgrade.recommendation.description}
				{upgrade.recommendation.description}
			{/if}
		</p>
	{/if}
	{#if upgrade.optional}
		<p class="text-xs text-muted-foreground">Recommended for more profit despite lower fortune.</p>
	{/if}
	{#if upgrade.increase === 0 && upgrade.max && upgrade.max > 0 && (upgrade.effects?.length ?? 0) === 0}
		{#if upgrade.stats}
			<p class="text-xs text-muted-foreground">Gives no fortune right away, but has later upgrades.</p>
		{:else}
			<p class="text-xs text-muted-foreground">Shown for completion!</p>
		{/if}
	{/if}
</div>
