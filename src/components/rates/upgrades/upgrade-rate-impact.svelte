<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import * as Popover from '$ui/popover';
	import { CROP_INFO, Crop, type UpgradeRateImpact } from 'farming-weight';

	interface Props {
		impact?: UpgradeRateImpact;
		coins?: number;
		totalCost?: number;
		items?: RatesItemPriceData;
		unavailableLabel?: string;
	}

	let { impact, coins = 0, totalCost = 0, items, unavailableLabel }: Props = $props();

	const totalCoins = $derived(coins);
	const payoffHours = $derived(totalCoins > 0 && totalCost > 0 ? totalCost / totalCoins : undefined);
	const npcRows = $derived.by(() => sortedRows(impact?.delta.coinSources));
	const rngRows = $derived.by(() =>
		sortedRows(impact?.delta.rngItems).map(([itemId, amount]) => {
			const price = getItemSellValue(itemId, items);
			return {
				itemId,
				name: getItemName(itemId, items),
				amount,
				price,
				coins: amount * price,
			};
		})
	);
	const currencyRows = $derived.by(() =>
		sortedRows(impact?.delta.currencies).map(([currencyId, amount]) => ({
			currencyId,
			name: getCurrencyName(currencyId, items),
			amount,
		}))
	);
	const collectionRows = $derived.by(() => {
		const itemRows = sortedRows(impact?.delta.items).map(([key, value]) => ({
			id: `item:${key}`,
			key: getItemName(key, items),
			value,
		}));
		const itemNames = new Set(itemRows.map((row) => row.key));
		const otherRows = sortedRows(impact?.delta.otherCollection)
			.map(([key, value]) => ({
				id: `other:${key}`,
				key: getItemName(key, items),
				value,
			}))
			.filter((row) => row.key !== 'Normal' && !itemNames.has(row.key));

		return [...itemRows, ...otherRows];
	});
	const hasAnyDelta = $derived(
		!!impact &&
			(totalCoins !== 0 ||
				impact.delta.collection !== 0 ||
				npcRows.length > 0 ||
				rngRows.length > 0 ||
				currencyRows.length > 0 ||
				collectionRows.length > 0)
	);

	function formatRate(value: number): string {
		return value.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		});
	}

	function formatPrecise(value: number): string {
		return value.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		});
	}

	function formatSigned(value: number, suffix = ''): string {
		return `${value > 0 ? '+' : ''}${formatPrecise(value)}${suffix}`;
	}

	function formatPayoff(hours: number): string {
		if (!Number.isFinite(hours) || hours <= 0) return 'N/A';

		const totalMinutes = Math.max(1, Math.round(hours * 60));
		const minutes = totalMinutes % 60;
		const totalHours = Math.floor(totalMinutes / 60);
		const remainingHours = totalHours % 24;
		const days = Math.floor(totalHours / 24);

		if (days > 0) {
			return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
		}

		if (totalHours > 0) {
			return minutes > 0 ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
		}

		return `${minutes}m`;
	}

	function sortedRows(record: Record<string, number> | undefined): [string, number][] {
		return Object.entries(record ?? {})
			.filter(([, value]) => value !== 0)
			.sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
	}

	function getItemName(itemId: string, itemsLookup?: RatesItemPriceData) {
		const item = itemsLookup?.[itemId];
		return item?.item?.name ?? item?.bazaar?.name ?? getCropName(itemId) ?? itemId;
	}

	function getCurrencyName(currencyId: string, itemsLookup?: RatesItemPriceData) {
		if (currencyId === 'SEASONING') return 'Seasoning';
		return getItemName(currencyId, itemsLookup);
	}

	function getCropName(itemId: string) {
		if (!Object.values(Crop).includes(itemId as Crop)) return undefined;
		return CROP_INFO[itemId as Crop]?.name;
	}

	function getItemSellValue(itemId: string, itemsLookup?: RatesItemPriceData) {
		const item = itemsLookup?.[itemId];
		if (!item) return 0;

		const npc = item.bazaar?.npc || item.item?.npc_sell_price || 0;
		const bazaar = item.bazaar?.averageSellOrder || item.bazaar?.averageSell || 0;
		const auctionPrices = item.auctions
			?.map((auction) => (auction.lowest > 0 ? auction.lowest : auction.last))
			.filter((price) => price > 0);
		const auction = auctionPrices?.length ? Math.min(...auctionPrices) : 0;
		const marketValues = [bazaar, auction].filter((value) => value > 0);
		const market = marketValues.length ? Math.min(...marketValues) : 0;

		return Math.max(npc, market);
	}
</script>

{#if !impact && unavailableLabel}
	<span class="text-muted-foreground whitespace-nowrap">{unavailableLabel}</span>
{:else}
	<Popover.Mobile hasContent={!!impact} class="w-96 max-w-[calc(100vw-2rem)]">
		{#snippet trigger()}
			{#if totalCoins !== 0}
				<span class="flex flex-col items-end leading-tight">
					<span
						class="{totalCoins > 0
							? 'dark:text-completed'
							: 'text-destructive'} text-right font-semibold whitespace-nowrap"
					>
						{totalCoins > 0 ? '+' : ''}{formatRate(totalCoins)}/hr
					</span>
					{#if payoffHours}
						<span class="text-muted-foreground text-xs whitespace-nowrap">{formatPayoff(payoffHours)} payoff</span>
					{/if}
				</span>
			{:else}
				<span class="text-muted-foreground whitespace-nowrap">No Change</span>
			{/if}
		{/snippet}

		{#if impact}
			<div class="flex flex-col gap-3 text-sm">
				<div class="flex items-center justify-between gap-6">
					<p class="font-semibold">Rate Impact</p>
					<p class={totalCoins < 0 ? 'text-destructive font-semibold' : 'dark:text-completed font-semibold'}>
						{formatSigned(totalCoins)}/hr
					</p>
				</div>

				{#if totalCost > 0}
					<div class="flex flex-col gap-1">
						<p class="text-muted-foreground font-medium">Payoff Estimate</p>
						<div class="even:bg-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-sm">
							<p class="truncate">Upgrade Cost</p>
							<p class="font-mono">{formatRate(totalCost)}</p>
						</div>
						<div class="even:bg-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-sm">
							<p class="truncate">Time to Pay Off</p>
							<p class="font-mono {payoffHours ? 'dark:text-completed' : 'text-muted-foreground'}">
								{payoffHours ? formatPayoff(payoffHours) : 'No positive coin gain'}
							</p>
						</div>
					</div>
				{/if}

				{#if !hasAnyDelta}
					<p class="text-muted-foreground">No output differences were reported for this upgrade.</p>
				{:else}
					{#if collectionRows.length > 0}
						<div class="flex flex-col gap-1">
							<p class="text-muted-foreground font-medium">Collection Deltas</p>
							{#each collectionRows as row (row.id)}
								<div class="even:bg-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-sm">
									<p class="truncate">{row.key}</p>
									<p class="font-mono {row.value < 0 ? 'text-destructive' : 'dark:text-completed'}">
										{formatSigned(row.value)}
									</p>
								</div>
							{/each}
						</div>
					{/if}

					{#if npcRows.length > 0}
						<div class="flex flex-col gap-1">
							<p class="text-muted-foreground font-medium">NPC Coin Sources</p>
							{#each npcRows as [source, value] (source)}
								<div class="even:bg-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-sm">
									<p class="truncate">{source}</p>
									<p class="font-mono {value < 0 ? 'text-destructive' : 'dark:text-completed'}">
										{formatSigned(value)}
									</p>
								</div>
							{/each}
						</div>
					{/if}

					{#if currencyRows.length > 0}
						<div class="flex flex-col gap-1">
							<p class="text-muted-foreground font-medium">Currency Deltas</p>
							{#each currencyRows as row (row.currencyId)}
								<div class="even:bg-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-sm">
									<p class="truncate">{row.name}</p>
									<p class="font-mono {row.amount < 0 ? 'text-destructive' : 'dark:text-completed'}">
										{formatSigned(row.amount)}
									</p>
								</div>
							{/each}
						</div>
					{/if}

					{#if rngRows.length > 0}
						<div class="flex flex-col gap-1">
							<p class="text-muted-foreground font-medium">RNG Item Value</p>
							{#each rngRows as row (row.itemId)}
								<div class="even:bg-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-sm">
									<div class="min-w-0">
										<p class="truncate">{row.name}</p>
										<p class="text-muted-foreground text-xs">
											{formatSigned(row.amount)} items @ {formatRate(row.price)} each
										</p>
									</div>
									<p class="font-mono {row.coins < 0 ? 'text-destructive' : 'dark:text-completed'}">
										{formatSigned(row.coins)}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</Popover.Mobile>
{/if}
