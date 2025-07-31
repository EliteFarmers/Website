<script lang="ts">
	import { browser } from '$app/environment';
	import JumpLink from '$comp/jump-link.svelte';
	import UpgradeList from '$comp/rates/upgrades/upgrade-list.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Crop, type FortuneUpgrade } from 'farming-weight';
	import { Debounced, useDebounce, watch } from 'runed';

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
		if (items.length === 0) return {} as RatesItemPriceData;
		const response = await fetch('/api/items/' + items.join('|'));
		try {
			const jsonData = await response.json();

			const data = jsonData as RatesItemPriceData;
			return data;
		} catch {
			return undefined;
		}
	}

	let upgrades = $state([...$player.getUpgrades(), ...$player.getCropUpgrades(crop)]);

	const getUpgrades = useDebounce(() => {
		upgrades = [...$player.getUpgrades(), ...$player.getCropUpgrades(crop)];
	}, 750);

	watch([() => $player, () => crop], () => {
		getUpgrades();
	});

	const neededItems = $derived([
		...new Set(
			upgrades
				.map((up) => [
					Object.keys(up.cost?.items ?? {}),
					Object.keys(up.cost?.applyCost?.items ?? {}),
					up.purchase,
				])
				.flat(2)
				.filter(Boolean)
				.flat() as string[]
		),
	]);

	const debouncedItems = new Debounced(() => neededItems, 500);

	let itemsPromise = $derived<Promise<FetchedItems | undefined>>(getBazaarData(debouncedItems.current));

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
					? Math.min(...itemCost.auctions.filter((a) => a.lowest3Day > 0).map((a) => a.lowest3Day))
					: (itemCost.bazaar?.averageBuyOrder ?? 0);
				total += lowestPrice * amount;
			}
		}
	}
</script>

<div class="flex w-full flex-col gap-2">
	<div class="flex flex-row items-center justify-start gap-1">
		<h2 class="text-2xl font-bold">Available Upgrades</h2>
		<JumpLink id="upgrades" self={false} />
	</div>
	{#if (mode ?? 'classic') !== 'classic'}
		<div class="flex flex-row items-center gap-2 text-sm">
			<TriangleAlert size={20} class="text-completed -mb-1" />
			<p>These upgrades use Bazaar and Auction House prices which aren't available in this game mode.</p>
		</div>
	{/if}
	<p class="text-muted-foreground font-emoji text-sm">Every available fortune upgrade for {ctx.ignMeta}!</p>
	{#if !crop || crop.length === 0}
		<div class="flex flex-row items-center gap-2 text-sm">
			<TriangleAlert size={20} class="text-completed -mb-1" />
			<p>No crop selected! Select a crop to add crop specific upgrades to this list!</p>
		</div>
	{/if}
	{#await itemsPromise}
		<p class="text-muted-foreground text-sm">Loading item prices...</p>
	{:then loadedItems}
		<UpgradeList {upgrades} items={loadedItems} costFn={upgradeCost} />
	{:catch error}
		<p class="text-sm text-red-500">Error fetching item prices: {error.message}</p>
	{/await}
	<div class="text-muted-foreground flex flex-col items-center justify-center gap-2 p-4 text-sm">
		<p class="text-primary max-w-xl text-center">
			Upgrades such as strength for Mooshroom Cow and unlocking visitors for Green Thumb aren't shown here as
			those aren't things you can easily purchase. Be sure to check the above farming fortune categories for
			further upgrades!
		</p>

		{#if upgrades.length > 0}
			<p class="max-w-xl text-center">
				This list is generated based on averaged Bazaar and Auction House prices. Prices may vary and are not
				guaranteed to be accurate at the time of purchase.
			</p>
		{/if}
	</div>
</div>
