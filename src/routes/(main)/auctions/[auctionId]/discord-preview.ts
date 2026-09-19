import type { AuctionDto } from '$lib/api';
import { previewStat, previewText, type PreviewCard } from '$lib/discord-preview';

export function createPreview({ auction }: { auction: AuctionDto }): PreviewCard {
	return {
		title: auction.item?.name || auction.skyblockId || 'SkyBlock auction',
		description: auction.bin ? 'Buy It Now auction' : 'SkyBlock auction',
		lines: [
			previewStat('coins', auction.price),
			previewStat('items', auction.count),
			auction.seller?.name && '**Seller:** ' + previewText(auction.seller.name),
		],
	};
}
