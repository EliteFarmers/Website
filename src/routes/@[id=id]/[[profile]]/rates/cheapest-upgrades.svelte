<script lang="ts">
	import { browser } from '$app/environment';
	import ItemName from '$comp/items/item-name.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { components } from '$lib/api/api';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Crop, UpgradeAction, type FortuneUpgrade } from 'farming-weight';

	// const ratesData = getRatesData();
	const ctx = getStatsContext();
	const mode = $derived(ctx.selectedProfile?.gameMode);

	interface Props {
		player: RatesPlayerStore;
		crop: Crop;
	}

	let { player, crop }: Props = $props();

	async function getBazaarData(items: string[]) {
		if (!browser) return undefined;
		const response = await fetch('/rates/' + items.join('|'));
		try {
			const jsonData = await response.json();

			const data = jsonData as components['schemas']['GetSpecifiedSkyblockItemsResponse'];
			console.log('Fetched bazaar data for', items, data?.items);
			return data?.items;
		} catch {
			return undefined;
		}
	}

	const upgrades = $derived($player.getUpgrades(crop));

	let itemsPromise = $derived<ReturnType<typeof getBazaarData> | undefined>(
		getBazaarData([
			...new Set(
				upgrades
					.map((up) => Object.keys(up.cost?.items ?? {}))
					.flat()
					.filter(Boolean)
					.flat()
			),
		])
	);

	async function getItem(item: string) {
		const response = await itemsPromise;
		if (!response || !response[item]) return undefined;
		return response[item];
	}
</script>

<div class="flex w-full flex-col gap-2">
	<h2 class="text-2xl font-bold">Cheapest Upgrades</h2>
	{#if (mode ?? 'classic') !== 'classic'}
		<div class="flex flex-row items-center gap-2 text-sm">
			<TriangleAlert size={20} class="-mb-1 text-completed" />
			<p>These upgrades use Bazaar and Auction House prices which aren't available in this game mode. {mode}</p>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">These are the cheapest upgrades available for {ctx.ignMeta}!</p>
	{/if}
	<hr />
	{#each upgrades as up (up)}
		{@render upgrade(up)}
	{/each}
</div>

{#snippet upgrade(upgrade: FortuneUpgrade)}
	<div class="flex flex-col gap-4 rounded-md border bg-card px-4 py-2">
		<div class="flex flex-row items-center justify-between gap-4">
			<div class="flex flex-1 flex-col items-start justify-center">
				<p><ItemName name={upgrade.title} /></p>
				<p class="text-sm">
					{#if upgrade.action === UpgradeAction.Apply && upgrade.onto?.name}
						<span>Apply {upgrade.category} on</span> <ItemName name={upgrade.onto.name} />
					{:else if upgrade.action === UpgradeAction.LevelUp && upgrade.onto?.name}
						<span>Level up {upgrade.category} on</span>
						<ItemName name={upgrade.onto.name} />
						<!-- {:else if upgrade.action === UpgradeAction.Recombobulate && upgrade.onto?.name}
            <span>Recombobulate</span> <ItemName name={upgrade.onto.name} /> -->
					{:else if upgrade.action === UpgradeAction.Purchase}
						<span>Purchase {upgrade.title}</span>
					{/if}
				</p>
			</div>
			<div class="flex flex-col items-end justify-center">
				{#each Object.entries(upgrade.cost?.items ?? {}) as [item, amount] (item)}
					{@render itemCost(item, amount)}
				{/each}
				{#if upgrade.cost?.coins}
					<p class="text-sm text-muted-foreground">+ {upgrade.cost?.coins?.toLocaleString()} coins</p>
				{/if}
			</div>
			<!-- <pre>
        {JSON.stringify(upgrade, null, 2)}
      </pre> -->
			{#if upgrade.increase > 0}
				<FortuneBreakdown total={upgrade.increase} />
			{/if}
		</div>
		<!-- <pre>
{JSON.stringify(upgrade, null, 2)}
    </pre> -->
	</div>
{/snippet}

{#snippet itemCost(item: string, amount: number)}
	<div class="flex flex-row items-center gap-2">
		<span class="text-sm">{amount}x</span>
		{#await getItem(item) then sbItem}
			{#if sbItem?.data?.name}
				<span class="text-sm"><ItemName name={sbItem.data.name} /></span>
			{:else}
				<!-- Replace underscores with spaces and capitalize first letter of each word -->
				{@const itemName = item
					.replace(/_/g, ' ')
					.toLowerCase()
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')}

				<span class="text-sm">{itemName}</span>
			{/if}

			{#if sbItem?.auctions && sbItem.auctions.length > 0}
				{@const lowest = Math.min(...sbItem.auctions.map((a) => a.lowest3Day))}
				<span class="text-sm text-green-500">
					{Math.round(lowest * amount).toLocaleString()} coins
				</span>
			{:else if sbItem?.bazaar}
				{@const averageBuyOrder = sbItem.bazaar.averageBuyOrder}
				<span class="text-sm text-green-500">
					{Math.round(averageBuyOrder * amount).toLocaleString()} coins
				</span>
			{/if}
		{:catch}
			<span class="text-sm text-red-500">Error fetching price</span>
		{/await}
	</div>
{/snippet}
