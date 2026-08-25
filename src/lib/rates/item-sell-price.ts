import type { RatesItemPriceData } from '$lib/api/elite';

export interface ItemSellPrice {
	coins: number;
	source: 'npc' | 'bazaar' | 'auction';
}

export function getBestItemSellPrice(
	item: RatesItemPriceData[string] | undefined,
	includeMarketPrices = true
): ItemSellPrice | undefined {
	if (!item) return;

	const npc = item.bazaar?.npc || item.item?.npc_sell_price || 0;
	if (!includeMarketPrices) return npc > 0 ? { coins: npc, source: 'npc' } : undefined;

	const bazaar = item.bazaar?.averageSellOrder || item.bazaar?.averageSell || 0;
	const auctionPrices = item.auctions
		?.map((auction) => (auction.lowest > 0 ? auction.lowest : auction.last))
		.filter((price) => price > 0);
	const auction = auctionPrices?.length ? Math.min(...auctionPrices) : 0;
	const market = [
		{ coins: bazaar, source: 'bazaar' as const },
		{ coins: auction, source: 'auction' as const },
	]
		.filter((price) => price.coins > 0)
		.sort((a, b) => a.coins - b.coins)[0];

	return npc > 0 && npc >= (market?.coins ?? 0) ? { coins: npc, source: 'npc' } : market;
}
