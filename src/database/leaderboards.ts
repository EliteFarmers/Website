import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { DBReady, sequelize } from './database';

export interface LeaderboardEntry {
	uuid: string;
	profile: string;
	cute_name: string;
	ign: string;
	rank?: number;
	amount: number;
}

export interface LeaderboardPage {
	limit: number;
	property: string;
	name: string;
	default?: true;
}

export interface LeaderboardCategory {
	default?: string;
	name?: string;
	format?: 'number' | 'decimal';
	column: string;
	path: string;
	pages: Record<string, LeaderboardPage>;
}

export type Leaderboard = LeaderboardEntry[];

export const LEADERBOARDS: Partial<Record<string, LeaderboardCategory>> = {
	weight: {
		column: 'info',
		path: 'farming',
		format: 'decimal',
		pages: {
			DEFAULT: {
				limit: 1_000,
				property: 'total',
				name: 'Farming Weight',
			},
		},
	},
	skills: {
		column: 'skyblock',
		path: '[profile].member.skills',
		name: 'Skills',
		format: 'decimal',
		pages: {
			combat: {
				limit: 1_000,
				property: 'combat',
				name: 'Combat XP',
			},
			mining: {
				limit: 1_000,
				property: 'mining',
				name: 'Mining XP',
			},
			farming: {
				limit: 1_000,
				property: 'farming',
				name: 'Farming XP',
			},
			foraging: {
				limit: 1_000,
				property: 'foraging',
				name: 'Foraging XP',
			},
			fishing: {
				limit: 1_000,
				property: 'fishing',
				name: 'Fishing XP',
			},
			enchanting: {
				limit: 1_000,
				property: 'enchanting',
				name: 'Enchanting XP',
			},
			alchemy: {
				limit: 1_000,
				property: 'alchemy',
				name: 'Alchemy XP',
			},
			taming: {
				limit: 1_000,
				property: 'taming',
				name: 'Taming XP',
			},
			social: {
				limit: 1_000,
				property: 'social',
				name: 'Social XP',
			},
			runecrafting: {
				limit: 1_000,
				property: 'runecrafting',
				name: 'Runecrafting XP',
			},
			carpentry: {
				limit: 1_000,
				property: 'carpentry',
				name: 'Carpentry XP',
			},
		},
	},
	crops: {
		column: 'skyblock',
		path: '[profile].member.collection',
		name: 'Collections',
		format: 'number',
		pages: {
			cactus: {
				limit: 1_000,
				property: 'CACTUS',
				name: 'Cactus Collection',
			},
			carrot: {
				limit: 1_000,
				property: 'CARROT_ITEM',
				name: 'Carrot Collection',
			},
			cocoa: {
				limit: 1_000,
				property: 'INK_SACK:3',
				name: 'Cocoa Bean Collection',
			},
			melon: {
				limit: 1_000,
				property: 'MELON',
				name: 'Melon Collection',
			},
			mushroom: {
				limit: 1_000,
				property: 'MUSHROOM_COLLECTION',
				name: 'Mushroom Collection',
			},
			potato: {
				limit: 1_000,
				property: 'POTATO_ITEM',
				name: 'Potato Collection',
			},
			pumpkin: {
				limit: 1_000,
				property: 'PUMPKIN',
				name: 'Pumpkin Collection',
			},
			sugarcane: {
				limit: 1_000,
				property: 'SUGAR_CANE',
				name: 'Sugar Cane Collection',
			},
			netherwart: {
				limit: 1_000,
				property: 'NETHER_STALK',
				name: 'Nether Wart Collection',
			},
			wheat: {
				limit: 1_000,
				property: 'WHEAT',
				name: 'Wheat Collection',
			},
		},
	},
	contests: {
		column: 'skyblock',
		path: '[profile].member.jacob',
		name: 'Contests',
		format: 'number',
		pages: {
			DEFAULT: {
				limit: 1_000,
				property: 'participations',
				name: 'Jacob Contest Participations',
			},
		},
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

export async function GetLeaderboardSlice(offset: number, limit: number, category: string, page = 'DEFAULT') {
	if (LeaderboardCache.has(`${category}-${page}`)) {
		const lastUpdated = LastUpdated.get(`${category}-${page}`) ?? 0;

		if (Date.now() - lastUpdated < LEADERBOARD_UPDATE_INTERVAL) {
			const leaderboard = LeaderboardCache.get(`${category}-${page}`) ?? [];

			return leaderboard.slice(offset, offset + limit);
		}
	}

	const leaderboard = await FetchLeaderboard(category, page);

	if (!leaderboard) return [];

	return leaderboard.slice(offset, offset + limit);
}

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

	const rawQuery = onProfile
		? `
		SELECT ign, uuid, amount, profile_id as profile, cute_name
		FROM (
			SELECT ign, uuid, elem->'${path.join("'->'")}'->'${
				page.property
		  }' as amount, elem->'profile_id' as profile_id, elem->'cute_name' as cute_name
			FROM users, jsonb_array_elements(skyblock->'profiles') a(elem)
			) sub
		WHERE amount is not null and amount::dec > 0
		ORDER BY amount::dec DESC
		LIMIT ${page.limit};
	`
		: `
		SELECT ign, uuid, amount, profile, cute_name
		FROM (
			SELECT ign, uuid, elem.val->'${path.join("'->'")}'->'${
				page.property
		  }' as amount, elem.profile as profile, elem.val->'cute_name' as cute_name
			FROM users, jsonb_each(info->'profiles') as elem(profile, val)
			WHERE jsonb_typeof(info->'profiles') != 'array'
			) sub
		WHERE amount is not null and amount::dec > 0
		ORDER BY amount::dec DESC
		LIMIT 1000;
	`;

	const raw = await sequelize
		.query(rawQuery, {
			raw: true,
			nest: true,
		})
		.catch((e) => console.log(e));

	if (!raw) return undefined;

	LeaderboardCache.set(cacheKey, raw as Leaderboard);
	LastUpdated.set(cacheKey, Date.now());

	return raw as Leaderboard;
}

export async function FetchLeaderboardRank(uuid: string, category: string, page?: string, profile?: string) {
	const leaderboard = await FetchLeaderboard(category, page);

	if (!leaderboard) return -1;

	const rank = leaderboard.findIndex((entry) => entry.uuid === uuid && (!profile || entry.profile === profile));

	if (rank === -1) return -1;

	return rank + 1;
}

export async function FetchLeaderboardRankings(uuid: string, profile?: string) {
	const rankings: Record<string, Record<string, number>> = {};

	for (const category of LeaderboardCategories) {
		const categoryPages = LEADERBOARDS[category]?.pages;

		for (const page of Object.keys(categoryPages ?? {})) {
			const rank = await FetchLeaderboardRank(uuid, category, page, profile);

			if (rank === -1) continue;

			if (!rankings[category] as boolean) rankings[category] = {};
			rankings[category][page] = rank;
		}
	}

	return rankings;
}
