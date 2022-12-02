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
	const path = category.path.replace('[profile].', '').split('.');

	const exclude = ['info', 'profile', 'account', 'player', 'skyblock', 'createdAt', 'updatedAt'];
	if (!onProfile) exclude.push('skyblock');
	
	//const startTime = Date.now();
	/*
	const list = await User.findAll({
		//limit: page.limit,
		//offset: offset,
		attributes: {
			exclude: exclude,
			include: [
				[sequelize.fn('jsonb_extract_path', sequelize.col(category.column), ...path, page.property), 'amount'],
				[sequelize.fn('jsonb_extract_path', sequelize.col(category.column), 'profiles'), 'profiles'],
				// Cross join the profiles
				//[sequelize.fn('jsonb_array_elements', 'skyblock.profiles'), 'profile'],
			],
		},
		where: { ['info.cheating']: { [Op.not]: true }, ['info.highest.farming.weight']: { [Op.gt]: 0 } },
		// order: [[sequelize.literal('weight'), 'DESC']],
		raw: true,
		nest: true,
	}).catch((e) => console.log(e));
	*/
	const rawQuery = `
	SELECT *
	FROM   users
	WHERE  skyblock->'profiles'->'array' @? '$ ? (exists (@."member"))';
	`;
	const raw = await sequelize
		.query(rawQuery, {
			raw: true,
			nest: true,
		}).catch((e) => console.log(e));

	return raw;
	/*
	const leaderboard: LeaderboardEntry[] = list.map((entry) => {
		const highest = entry.skyblock?.profiles.sort((a, b) => {
			const aAmount = a.member.collection?.[page.property] ?? 0;
			const bAmount = b.member.collection?.[page.property] ?? 0;

			return bAmount - aAmount;
		})[0];
		
		return {
			uuid: entry.uuid,
			profile: highest?.profile_id ?? '',
			ign: entry.ign ?? 'N/A',
			rank: 0,
			amount: highest?.member.collection?.[page.property] ?? 0,
		}
	}).sort((a, b) => b.amount - a.amount).map((entry, index) => ({ ...entry, rank: index + 1 }));

	LeaderboardCache.set(cacheKey, leaderboard);
	LastUpdated.set(cacheKey, Date.now());

	const endTime = Date.now();
	console.log(`Fetched leaderboard ${categoryName} in ${endTime - startTime}ms`);

	//console.log(leaderboard);
	return leaderboard;*/
}