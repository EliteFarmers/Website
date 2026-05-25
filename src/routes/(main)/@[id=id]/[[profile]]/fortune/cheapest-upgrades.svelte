<script lang="ts">
	import { browser } from '$app/environment';
	import JumpLink from '$comp/jump-link.svelte';
	import UpgradeList from '$comp/rates/upgrades/upgrade-list.svelte';
	import { trackAnalytics } from '$lib/analytics';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { getItemsFromUpgrades, getUpgradeCost } from '$lib/items';
	import { getItem, getItems } from '$lib/remote/items.remote';
	import { getRatesData } from '$lib/stores/ratesData';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import Settings from '@lucide/svelte/icons/settings';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import {
		Crop,
		Stat,
		getRateCalculationStateKey,
		type FarmingPlayer,
		type FortuneUpgrade,
		type UpgradeRateImpact,
	} from 'farming-weight';
	import { Debounced } from 'runed';

	const ctx = getStatsContext();
	const ratesData = getRatesData();
	const mode = $derived(ctx.selectedProfile?.gameMode);

	async function getBazaarData(items: string[]) {
		if (!browser) return undefined;
		if (items.length === 0) return {} as RatesItemPriceData;
		return await getItems(items);
	}

	interface Props {
		player: RatesPlayerStore;
		crop: Crop;
		blocksPerHour?: number;
	}

	let { player, crop, blocksPerHour = 72_000 }: Props = $props();

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const rateImpactMemo = new Map<string, UpgradeRateImpact>();
	const maxRateImpactMemoEntries = 2_500;

	const upgrades = $derived.by(() => mergeUpgrades($player, crop));
	const playerRateStateKey = $derived.by(() => getRateCalculationStateKey($player, crop));
	const rateImpactCache = $derived.by(() =>
		buildRateImpactCache($player, upgrades, crop, blocksPerHour, playerRateStateKey)
	);

	function mergeUpgrades(p: FarmingPlayer, c: Crop) {
		const all = [
			...p.getUpgrades({ stats: [Stat.FarmingFortune, Stat.Overbloom], includeUpgradeGroups: true }),
			...p.getCropUpgrades(c),
		];
		const seen: Record<string, boolean> = {};
		const deduped: FortuneUpgrade[] = [];
		for (const u of all) {
			const key = (u as { conflictKey?: string }).conflictKey ?? `${u.title}::${u.action}`;
			if (seen[key]) continue;
			seen[key] = true;
			deduped.push(u);
		}
		return deduped;
	}

	function getUpgradeKey(upgrade: FortuneUpgrade) {
		return (
			upgrade.conflictKey ??
			`${upgrade.title}::${upgrade.action}::${upgrade.meta?.type ?? ''}::${upgrade.meta?.key ?? ''}`
		);
	}

	function hashKey(value: string) {
		let hash = 0;
		for (let i = 0; i < value.length; i++) {
			hash = (hash * 31 + value.charCodeAt(i)) | 0;
		}
		return hash;
	}

	function getRateImpactKey(
		upgrade: FortuneUpgrade,
		activeCrop = crop,
		activeBlocksPerHour = blocksPerHour,
		activePlayerStateKey = playerRateStateKey
	) {
		return `${activePlayerStateKey}::${activeCrop}::${activeBlocksPerHour.toFixed(4)}::${getUpgradeKey(upgrade)}`;
	}

	function buildRateImpactCache(
		p: FarmingPlayer,
		rows: FortuneUpgrade[],
		activeCrop: Crop,
		activeBlocksPerHour: number,
		activePlayerStateKey: string
	) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const values = new Map<string, UpgradeRateImpact>();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const activeKeys = new Set<string>();
		let version = rows.length + activeBlocksPerHour + hashKey(activePlayerStateKey);

		if (activeCrop && activeBlocksPerHour > 0) {
			let beforeRates: UpgradeRateImpact['before'] | undefined;

			for (const upgrade of rows) {
				const key = getRateImpactKey(upgrade, activeCrop, activeBlocksPerHour, activePlayerStateKey);
				let impact = rateImpactMemo.get(key);
				if (!impact) {
					beforeRates ??= p.getRates(activeCrop, activeBlocksPerHour);
					impact = p.getUpgradeRateImpact(upgrade, {
						crop: activeCrop,
						blocksBroken: activeBlocksPerHour,
						before: beforeRates,
					});
					rateImpactMemo.set(key, impact);
				}

				activeKeys.add(key);
				values.set(key, impact);
				version += impact.delta.totalItems;
			}
		}

		pruneRateImpactMemo(activeKeys);
		return { values, version };
	}

	function pruneRateImpactMemo(activeKeys: Set<string>) {
		if (rateImpactMemo.size <= maxRateImpactMemoEntries) return;

		for (const key of rateImpactMemo.keys()) {
			if (!activeKeys.has(key)) {
				rateImpactMemo.delete(key);
			}
			if (rateImpactMemo.size <= maxRateImpactMemoEntries) return;
		}
	}

	function getRateImpact(upgrade: FortuneUpgrade) {
		return rateImpactCache.values.get(getRateImpactKey(upgrade));
	}

	function hasUpgradePath(upgrade: FortuneUpgrade) {
		return (
			$player.expandUpgrade(upgrade, {
				includeAllTierUpgradeChildren: true,
				maxDepth: 1,
				stats: [Stat.FarmingFortune],
			}).children.length > 0
		);
	}

	function getRateImpactItems(cache: { values: Map<string, UpgradeRateImpact> }) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const items = new Set<string>();
		for (const impact of cache.values.values()) {
			for (const itemId of Object.keys(impact.delta.items ?? {})) {
				items.add(itemId);
			}
			for (const itemId of Object.keys(impact.delta.rngItems ?? {})) {
				items.add(itemId);
			}
		}
		return [...items];
	}

	const neededItems = $derived([
		...new Set([...getItemsFromUpgrades(upgrades), ...getRateImpactItems(rateImpactCache)]),
	]);

	const debouncedItems = new Debounced(() => neededItems, 500);

	let itemsData = $state<RatesItemPriceData>({});
	let itemsVersion = $state(0);
	let isInitialLoad = $state(true);
	let isLoadingItems = $state(true);
	let itemLoadError = $state<unknown>(null);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const requestedFallbackItems = new Set<string>();

	$effect(() => {
		if (!isInitialLoad) return;

		const needed = debouncedItems.current;
		let cancelled = false;
		isLoadingItems = true;
		itemLoadError = null;

		void getBazaarData(needed)
			.then((data) => {
				if (cancelled) return;
				if (data) {
					Object.assign(itemsData, data);
					itemsVersion++;
				}
				isInitialLoad = false;
				isLoadingItems = false;
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				itemLoadError = error;
				isLoadingItems = false;
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (isInitialLoad) return;
		const needed = debouncedItems.current;
		const missing = needed.filter((id) => !itemsData[id] && !requestedFallbackItems.has(id));

		if (missing.length > 0) {
			for (const id of missing) requestedFallbackItems.add(id);
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
	<div class="flex flex-row items-center justify-between gap-1">
		<div class="flex flex-row items-center justify-start gap-1">
			<h2 class="text-2xl font-bold">Available Upgrades</h2>
			<JumpLink id="upgrades" self={false} />
		</div>
		<div>
			<Button
				onclick={() => {
					$ratesData.settings = true;
					trackAnalytics('fortune.settings_opened');
				}}
			>
				<Settings size={20} />
				<span class="max-md:sr-only">Settings</span>
			</Button>
		</div>
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
	{#if isLoadingItems}
		<p class="text-muted-foreground text-sm">Loading item prices...</p>
	{:else if itemLoadError}
		<p class="text-sm text-red-500">
			Error fetching item prices: {itemLoadError instanceof Error ? itemLoadError.message : String(itemLoadError)}
		</p>
	{:else}
		<UpgradeList
			{upgrades}
			items={itemsData}
			version={itemsVersion + rateImpactCache.version}
			costFn={getUpgradeCost}
			rateImpactFn={getRateImpact}
			rateImpactUnavailableLabel={crop ? undefined : 'Select a Crop'}
			applyUpgrade={(u) => {
				$player.applyUpgrade(u);
				player.refresh();
			}}
			expandUpgrade={(u) =>
				$player.expandUpgrade(u, {
					includeAllTierUpgradeChildren: true,
					stats: [Stat.FarmingFortune],
				})}
			{hasUpgradePath}
		/>
	{/if}
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
