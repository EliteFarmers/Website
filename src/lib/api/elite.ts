import type {
	AuctionItemDto,
	AuthorizedAccountDto,
	BazaarProductSummaryDto,
	ItemResponse,
	LeaderboardEntryDto,
	WeightStyleWithDataDto,
} from './schemas';

export type AuthorizedUser = AuthorizedAccountDto;
export type LeaderboardEntry = LeaderboardEntryDto & {
	style?: WeightStyleWithDataDto['leaderboard'];
};
export interface UserInfo {
	id: string;
	username: string;
	avatar: string;
	primaryUuid?: string;
	primaryName?: string;
}

export type ProfileGameMode = 'island' | 'bingo' | 'ironman' | 'classic';

export interface ProfileDetails {
	id: string;
	name: string;
	selected: boolean;
	gameMode?: ProfileGameMode;
	weight: number;
}

export type RatesItemPriceData = Record<
	string,
	{
		auctions?: AuctionItemDto[];
		bazaar?: BazaarProductSummaryDto;
		item?: ItemResponse;
	}
>;
