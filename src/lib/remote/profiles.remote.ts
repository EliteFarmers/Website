import { query } from '$app/server';
import {
	getInventoryItemMeta,
	getPlayerLeaderboardRanks,
	getProfile,
	getProfileInventory,
	getSelectedProfile,
	zodGetPlayerLeaderboardRanksParams,
	zodGetProfileInventoryParams,
	zodGetProfileParams,
	zodGetSelectedProfileParams,
	type AuctionItemDto,
	type BazaarProductSummaryDto,
	type HypixelInventoryDto,
	type ItemResponse,
} from '$lib/api';
import { cache } from '$lib/servercache';
import * as zod from 'zod';

export const getProfileMember = query(zodGetProfileParams, async (params) => {
	return await getProfile(params.playerUuid, params.profileUuid).then((res) => res.data);
});

export const getSelectedMember = query(zodGetSelectedProfileParams, async (params) => {
	return await getSelectedProfile(params.playerUuid).then((res) => res.data);
});

export const getMemberRanks = query(zodGetPlayerLeaderboardRanksParams, async (params) => {
	return await getPlayerLeaderboardRanks(params.playerUuid, params.profileUuid).then((res) => res.data);
});

export const getMemberInventory = query(zodGetProfileInventoryParams, async (params) => {
	return await getProfileInventory(params.playerUuid, params.profileUuid, params.inventory).then((res) => res.data);
});

export const getMemberInventories = query(
	zodGetProfileParams.extend({ inventories: zod.array(zod.string()) }),
	async (params) => {
		const inventories = await Promise.all(
			params.inventories.map((inventoryId) =>
				getProfileInventory(params.playerUuid, params.profileUuid, inventoryId).then((res) => res.data)
			)
		);

		const result: Record<string, HypixelInventoryDto> = {};

		inventories.forEach((inv) => {
			if (inv) {
				result[inv.name] = inv;
			}
		});

		return result;
	}
);

export const getInventoryItemDetails = query(
	zod.object({
		skyblockId: zod.string(),
		inventoryUuid: zod.string(),
		slotId: zod.string(),
		packs: zod.string().optional(),
		sub: zod.string().optional(),
	}),
	async (params) => {
		const meta = await getInventoryItemMeta(params.inventoryUuid, params.slotId, {
			packs: params.packs,
			sub: params.sub,
		}).then((res) => res.data);

		const bz = cache?.bazaar.products;
		const ah = cache?.auctions.items;
		const sbItems = cache?.items;

		const result: {
			auctions?: AuctionItemDto[];
			bazaar?: BazaarProductSummaryDto;
			item?: ItemResponse;
			meta: typeof meta;
		} = {
			meta,
		};

		if (bz && bz[params.skyblockId]) {
			result.bazaar = bz[params.skyblockId];
		}
		if (ah && ah[params.skyblockId]) {
			result.auctions = ah[params.skyblockId];
		}
		if (sbItems && sbItems[params.skyblockId]) {
			result.item = sbItems[params.skyblockId] ?? undefined;
		}

		return result;
	}
);
