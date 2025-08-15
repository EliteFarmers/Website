<script lang="ts">
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import { COMPOSTER_UPGRADE_TO_IMG } from '$lib/constants/composter';
	import { getItemsFromCosts, getUpgradeCostBreakdown } from '$lib/items';
	import { getItems } from '$lib/remote/items.remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Info from '@lucide/svelte/icons/info';
	import { ComposterUpgrade, getComposterStats, type UpgradeInfo } from 'farming-weight';

	const ctx = getStatsContext();
	const garden = $derived(ctx.garden);

	const maxLevel = 25;

	let currentUpgrades = $derived(
		garden?.composter?.upgrades ?? {
			[ComposterUpgrade.Speed]: 0,
			[ComposterUpgrade.MultiDrop]: 0,
			[ComposterUpgrade.FuelCap]: 0,
			[ComposterUpgrade.OrganicMatterCap]: 0,
			[ComposterUpgrade.CostReduction]: 0,
		}
	);

	const allMaxed = $derived(Object.values(currentUpgrades).every((level) => level >= maxLevel));
	const progress = $derived(getComposterStats(currentUpgrades));

	let selected = $derived(
		(Object.entries(currentUpgrades).find(([, value]) => value < maxLevel)?.[0] ??
			ComposterUpgrade.Speed) as ComposterUpgrade
	);
	const selectedProgress = $derived(progress.progress.find((p) => p.key === selected));

	const itemList = $derived(getItemsFromCosts(Object.values(progress.costToMax)));
	const fetchedItems = $derived(itemList.length > 0 ? getItems(itemList) : undefined);
</script>

<div class="w-full max-w-7xl">
	<div class="flex flex-col items-center gap-4 md:flex-row md:justify-center">
		<div class="flex w-full max-w-2xl flex-1 flex-col gap-1">
			<h3 class="mt-2 mb-4 text-xl leading-none font-semibold">Composter Upgrades</h3>
			{@render upgrade(ComposterUpgrade.Speed)}
			{@render upgrade(ComposterUpgrade.MultiDrop)}
			{@render upgrade(ComposterUpgrade.FuelCap)}
			{@render upgrade(ComposterUpgrade.OrganicMatterCap)}
			{@render upgrade(ComposterUpgrade.CostReduction)}
		</div>
		{#if !allMaxed}
			<div class="flex flex-1 flex-col gap-2 rounded-md">
				{#if selectedProgress}
					<h3 class="mt-2 mb-4 flex flex-row items-center gap-1 text-xl leading-none font-semibold">
						{selectedProgress.name}
						{#if selectedProgress.wiki}
							<a
								href={selectedProgress.wiki}
								target="_blank"
								rel="noopener noreferrer"
								class="text-link mt-0.5"
							>
								<Info size={16} />
							</a>
						{/if}
					</h3>
					<div>
						{#if selectedProgress.upgrades?.[0]}
							{@render cost(selectedProgress.upgrades[0])}
						{:else}
							<p>Maxed out!</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

{#snippet upgrade(type: keyof typeof COMPOSTER_UPGRADE_TO_IMG)}
	{@const Icon = COMPOSTER_UPGRADE_TO_IMG[type as keyof typeof COMPOSTER_UPGRADE_TO_IMG]}
	{@const level = currentUpgrades[type as keyof typeof currentUpgrades] ?? 0}
	<button
		class="flex flex-row items-center justify-between gap-1 rounded-md border-2 p-2 {selected === type && !allMaxed
			? 'border-border'
			: allMaxed
				? 'border-transparent'
				: 'hover:border-border/50 border-transparent'}"
		onclick={() => (selected = type)}
		disabled={allMaxed}
	>
		<Icon class="mr-2" />
		<div class="flex flex-1 flex-row gap-[2px] md:gap-1">
			{#each { length: maxLevel }, i (i)}
				<div
					class="h-5 w-full rounded-xs sm:rounded-sm md:block md:h-6 {i < level
						? level === maxLevel
							? 'bg-completed'
							: 'bg-progress'
						: 'bg-card'}"
				></div>
			{/each}
		</div>

		<span class="ml-2 min-w-8 font-semibold">{level}</span>
	</button>
{/snippet}

{#snippet cost(upgrade: UpgradeInfo)}
	{@const { total, breakdown } = getUpgradeCostBreakdown(upgrade, fetchedItems?.current)}
	{@const { total: toMax, breakdown: maxBreakdown } = getUpgradeCostBreakdown(
		progress.costToMax[selected],
		fetchedItems?.current
	)}
	{@const Icon = COMPOSTER_UPGRADE_TO_IMG[selected]}
	{@const isPercent = upgrade.current < 1000}
	<div class="flex flex-col gap-2">
		<div class="flex w-full flex-row items-center justify-between">
			<span class="text-lg font-semibold">Upgrade Cost</span>
			<CoinsBreakdown coins={total} list={breakdown} title={upgrade.title} />
		</div>
		<div class="flex w-full flex-row items-center justify-between">
			<span class="text-lg font-semibold">Cost to Max</span>
			<CoinsBreakdown coins={toMax} list={maxBreakdown} title="All Remaining Levels" />
		</div>
		<div class="mt-4 flex w-full flex-row items-center justify-evenly gap-2">
			<div class="flex flex-col items-center gap-4 rounded-md border-1 p-4 px-8">
				<Icon class="size-16" />
				{#if isPercent}
					<span class="font-semibold">+ {Math.round(upgrade.current * 1000) / 10}%</span>
				{:else}
					<span class="font-semibold">{upgrade.current.toLocaleString()}</span>
				{/if}
			</div>
			<ArrowRight class="size-12" />
			<div class="flex flex-col items-center gap-4 rounded-md border-1 p-4 px-8">
				<Icon class="size-16" />
				{#if isPercent}
					<span class="font-semibold">+ {Math.round((upgrade.current + upgrade.increase) * 1000) / 10}%</span>
				{:else}
					<span class="font-semibold">{(upgrade.current + upgrade.increase).toLocaleString()}</span>
				{/if}
			</div>
		</div>
	</div>
{/snippet}
