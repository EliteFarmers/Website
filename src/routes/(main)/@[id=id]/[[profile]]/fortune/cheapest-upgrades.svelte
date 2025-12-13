<script lang="ts">
	import { browser } from '$app/environment';
	import JumpLink from '$comp/jump-link.svelte';
	import UpgradeList from '$comp/rates/upgrades/upgrade-list.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { getItemsFromUpgrades, getUpgradeCost } from '$lib/items';
	import { getItem, getItems } from '$lib/remote/items.remote';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Crop, Stat } from 'farming-weight';
	import { Debounced, useDebounce, watch } from 'runed';

	const ctx = getStatsContext();
	const mode = $derived(ctx.selectedProfile?.gameMode);

	async function getBazaarData(items: string[]) {
		if (!browser) return undefined;
		if (items.length === 0) return {} as RatesItemPriceData;
		return await getItems(items);
	}

	type FetchedItems = Awaited<ReturnType<typeof getBazaarData> | undefined>;
	interface Props {
		player: RatesPlayerStore;
		crop: Crop;
	}

	let { player, crop }: Props = $props();

	let upgrades = $state([...$player.getUpgrades({ stat: Stat.FarmingFortune }), ...$player.getCropUpgrades(crop)]);

	const getUpgrades = useDebounce(() => {
		upgrades = [...$player.getUpgrades({ stat: Stat.FarmingFortune }), ...$player.getCropUpgrades(crop)];
	}, 750);

	watch([() => $player, () => crop], () => {
		getUpgrades();
	});

	const neededItems = $derived(getItemsFromUpgrades(upgrades));

	const debouncedItems = new Debounced(() => neededItems, 500);

	let itemsData = $state<RatesItemPriceData>({});
	let itemsVersion = $state(0);
	let isInitialLoad = $state(true);

	let itemsPromise = $derived<Promise<FetchedItems | undefined>>(
		(async () => {
			if (!isInitialLoad) return undefined;
			const data = await getBazaarData(debouncedItems.current);
			if (data) {
				Object.assign(itemsData, data);
				itemsVersion++;
				isInitialLoad = false;
			}
			return data;
		})()
	);

	$effect(() => {
		if (isInitialLoad) return;
		const needed = debouncedItems.current;
		const missing = needed.filter((id) => !itemsData[id]);

		if (missing.length > 0) {
			Promise.all(missing.map((id) => getItem(id))).then((results) => {
				results.forEach((res, i) => {
					itemsData[missing[i]] = res;
				});
				itemsVersion++;
			});
		}
	});
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
	{:then}
		<UpgradeList
			{upgrades}
			items={itemsData}
			version={itemsVersion}
			costFn={getUpgradeCost}
			applyUpgrade={(u) => {
				$player.applyUpgrade(u);
				player.refresh();
				getUpgrades();
			}}
			expandUpgrade={(u) =>
				$player.expandUpgrade(u, {
					includeAllTierUpgradeChildren: true,
					stats: [Stat.FarmingFortune, Stat.BonusPestChance],
				})}
		/>
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
