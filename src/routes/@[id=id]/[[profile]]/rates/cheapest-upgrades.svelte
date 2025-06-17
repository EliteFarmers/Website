<script lang="ts">
	import { browser } from '$app/environment';
	import UpgradeList from '$comp/rates/upgrades/upgrade-list.svelte';
	import type { components } from '$lib/api/api';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Crop, type FortuneUpgrade } from 'farming-weight';

	// const ratesData = getRatesData();
	const ctx = getStatsContext();
	const mode = $derived(ctx.selectedProfile?.gameMode);

	type FetchedItems = Awaited<ReturnType<typeof getBazaarData> | undefined>;
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

	const generalUpgrades = $derived($player.getUpgrades());
	const cropUpgrades = $derived($player.getCropUpgrades(crop));
	const upgrades = $derived([...generalUpgrades, ...cropUpgrades]);

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

	function upgradeCost(upgrade: FortuneUpgrade, items: FetchedItems): number {
		let total = 0;

		if (upgrade.cost) {
			sumItems(upgrade.cost.items);
			total += upgrade.cost.coins ?? 0;
		}
		if (upgrade.cost?.applyCost) {
			sumItems(upgrade.cost.applyCost.items);
			total += upgrade.cost.applyCost.coins ?? 0;
		}

		return total;

		function sumItems(requiredItems?: Record<string, number>) {
			for (const [item, amount] of Object.entries(requiredItems ?? {})) {
				const itemCost = items?.[item];
				if (!itemCost) continue;
				const lowestPrice = itemCost.auctions?.length
					? Math.min(...itemCost.auctions.map((a) => a.lowest3Day))
					: (itemCost.bazaar?.averageBuyOrder ?? 0);
				total += lowestPrice * amount;
			}
		}
	}

	function costPerFortune(cost: number, increase: number): number {
		return increase > 0 ? Math.round(cost / increase) : 0;
	}

	function sortByCost(items: FetchedItems) {
		return (a: FortuneUpgrade, b: FortuneUpgrade) => {
			return (
				costPerFortune(upgradeCost(a, items), a.increase) - costPerFortune(upgradeCost(b, items), b.increase)
			);
		};
	}
</script>

<div class="flex w-full flex-col gap-2">
	<h2 class="text-2xl font-bold">Available Upgrades</h2>
	{#if (mode ?? 'classic') !== 'classic'}
		<div class="flex flex-row items-center gap-2 text-sm">
			<TriangleAlert size={20} class="-mb-1 text-completed" />
			<p>These upgrades use Bazaar and Auction House prices which aren't available in this game mode. {mode}</p>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">Every available fortune upgrade for {ctx.ignMeta}!</p>
	{/if}
	<hr />
	{#await itemsPromise}
		<p class="text-sm text-muted-foreground">Loading item prices...</p>
	{:then items}
		{@const sorted = upgrades.sort(sortByCost(items))}
		<UpgradeList upgrades={sorted} {items} costFn={upgradeCost} />
	{:catch error}
		<p class="text-sm text-red-500">Error fetching item prices: {error.message}</p>
	{/await}
</div>
