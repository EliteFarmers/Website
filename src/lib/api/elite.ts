import type { components } from './api';

export type AuthorizedUser = components['schemas']['AuthorizedAccountDto'];
export type LeaderboardEntry = components['schemas']['LeaderboardEntryDto'] & {
	style?: components['schemas']['WeightStyleWithDataDto']['leaderboard'];
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
		auctions?: components['schemas']['AuctionItemDto'][];
		bazaar?: components['schemas']['BazaarProductSummaryDto'];
		item?: components['schemas']['ItemResponse'];
	}
>;
