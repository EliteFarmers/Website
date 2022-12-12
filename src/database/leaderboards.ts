import { API_CROP_TO_CROP } from "$lib/constants/crops";
import { LEADERBOARD_UPDATE_INTERVAL } from "$lib/constants/data";
import type { ProfileData } from "$lib/skyblock";
import { Op } from "sequelize";
import { DBReady, sequelize, User } from "./database";

export interface LeaderboardEntry {
	uuid: string;
	profile: string;
	ign: string;
	rank: number;
	amount: number;
}

export interface LeaderboardPage {
	limit: number;
	property: string;
	default?: true;
}

export interface LeaderboardCategory {
	default?: string;
	column: string;
	path: string;
	pages: Record<string, LeaderboardPage>;
}

export type Leaderboard = LeaderboardEntry[];

export const LEADERBOARDS: Partial<Record<string, LeaderboardCategory>> = {
	weight: {
		column: 'info',
		path: 'highest.farming',
		pages: {
			DEFAULT: {
				limit: 1_000,
				property: 'weight',
			},
		}
	},
	skills: {
		column: 'skyblock',
		path: '[profile].member.skills',
		pages: {
			DEFAULT: {
				limit: 1_000,
				property: 'farming',
			},
			combat: {
				limit: 1_000,
				property: 'combat',
			},
			mining: {
				limit: 1_000,
				property: 'mining',
			},
			farming: {
				limit: 1_000,
				property: 'farming',
			},
			foraging: {
				limit: 1_000,
				property: 'foraging',
			},
			fishing: {
				limit: 1_000,
				property: 'fishing',
			},
			enchanting: {
				limit: 1_000,
				property: 'enchanting',
			},
			alchemy: {
				limit: 1_000,
				property: 'alchemy',
			},
			taming: {
				limit: 1_000,
				property: 'taming',
			},
			social: {
				limit: 1_000,
				property: 'social',
			},
		}
	},
	crops: {
		column: 'skyblock',
		path: '[profile].member.collection',
		pages: {
			cactus: {
				limit: 1_000,
				property: 'CACTUS',
			},
			carrot: {
				limit: 1_000,
				property: 'CARROT_ITEM'
			},
			cocoa: {
				limit: 1_000,
				property: 'INK_SACK:3'
			},
			melon: {
				limit: 1_000,
				property: 'MELON'
			},
			mushroom: {
				limit: 1_000,
				property: 'MUSHROOM_COLLECTION'
			},
			potato: {
				limit: 1_000,
				property: 'POTATO_ITEM'
			},
			pumpkin: {
				limit: 1_000,
				property: 'PUMPKIN'
			},
			sugarcane: {
				limit: 1_000,
				property: 'SUGAR_CANE'
			},
			netherwart: {
				limit: 1_000,
				property: 'NETHER_STALK'
			},
			wheat: {
				limit: 1_000,
				property: 'WHEAT'
			},
		}
	},
};

export const LeaderboardCategories = Object.keys(LEADERBOARDS);
export const LeaderboardPages = Object.values(LEADERBOARDS).reduce<string[]>((pages, category) => {
	if (!category) return pages;

	if ('pages' in category) {
		pages.push(...Object.keys(category.pages));
	}

	return pages;
}, []);

const LeaderboardCache = new Map<string, Leaderboard>();
const LastUpdated = new Map<string, number>();

export async function FetchLeaderboard(categoryName: string, pageName = 'DEFAULT') {
	const category = LEADERBOARDS[categoryName];
	const page = category?.pages[pageName];

	if (!category || !page || !DBReady) return undefined;

	const cacheKey = `${categoryName}-${pageName}`;

	if (LeaderboardCache.has(cacheKey)) {
		const lastUpdated = LastUpdated.get(cacheKey) ?? 0;

		if (Date.now() - lastUpdated < LEADERBOARD_UPDATE_INTERVAL) {
			return LeaderboardCache.get(cacheKey);
		}
	}

	const onProfile = category.column === 'skyblock';
	const path: string[] = category.path.replace('[profile].', '').split('.');

	const exclude = ['info', 'profile', 'account', 'player', 'skyblock', 'createdAt', 'updatedAt'];
	if (!onProfile) exclude.push('skyblock');
	
	const rawQuery = `
		SELECT ign, uuid, amount, profile_id, cute_name
		FROM (
			SELECT ign, uuid, elem->'${path.join("'->'")}'->'${page.property}' as amount, elem->'profile_id' as profile_id, elem->'cute_name' as cute_name
			FROM users, jsonb_array_elements(skyblock->'profiles') a(elem)
			) sub
		WHERE amount is not null
		ORDER BY amount::dec DESC
		LIMIT ${page.limit};
	`;

	const raw = await sequelize
		.query(rawQuery, {
			raw: true,
			nest: true,
		}).catch((e) => console.log(e));

	return raw;
}