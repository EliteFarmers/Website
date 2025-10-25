import type { LeaderboardInfoDto, LeaderboardsResponse } from '$lib/api';

export interface LeaderboardConfig {
	icon?: string;
	order?: number;
	subpage?: string;
}

type IntervalType = 'current' | 'weekly' | 'monthly';

export type LeaderboardInfo = LeaderboardInfoDto &
	LeaderboardConfig & {
		id: string;
		intervals?: IntervalType[];
		suffix: string;
	};

const sortByOrder = (a: LeaderboardInfo, b: LeaderboardInfo) => {
	if (a.order === undefined && b.order === undefined) return 0;
	if (a.order === undefined) return 1;
	if (b.order === undefined) return -1;
	return a.order - b.order;
};

export function parseLeaderboards(response?: LeaderboardsResponse): {
	leaderboards: Record<string, LeaderboardInfo>;
	categories: Record<string, LeaderboardInfo[]>;
} {
	const leaderboards = response?.leaderboards as Record<string, LeaderboardInfo>;
	if (!leaderboards) return { categories: {}, leaderboards: {} };

	const lookup = {} as Record<string, LeaderboardInfo>;

	const entries = Object.entries(leaderboards)
		.filter(([, v]) => v.intervalType + '' === 'Current')
		.map<LeaderboardInfo>(([key, value]) => {
			const config = LEADERBOARDS[key as keyof typeof LEADERBOARDS];

			const data = {
				...value,
				...(config ?? {}),
				intervals: ['current'] as IntervalType[],
				id: key,
				suffix: '',
			} satisfies LeaderboardInfo;

			if (leaderboards[`${key}-weekly`]) {
				data.intervals.push('weekly');
				lookup[`${key}-weekly`] = { ...data, id: `${key}-weekly`, suffix: ' Weekly' };
			}

			if (leaderboards[`${key}-monthly`]) {
				data.intervals.push('monthly');
				lookup[`${key}-monthly`] = { ...data, id: `${key}-monthly`, suffix: ' Monthly' };
			}

			if (data.itemId && !data.icon) {
				data.icon = `/api/item/${data.itemId}.webp`;
			}

			lookup[key] = data;
			return data;
		});

	const groups = Object.groupBy(entries, (lb) => lb.category);

	const categories: Record<string, LeaderboardInfo[]> = {
		General: (groups.General ?? []).sort(sortByOrder),
		Crops: (groups.Crops ?? []).sort(sortByOrder),
		Pests: (groups.Pests ?? []).sort(sortByOrder),
		Skills: (groups.Skills ?? []).sort(sortByOrder),
		Milestones: (groups.Milestones ?? []).sort(sortByOrder),
	};

	for (const [key, group] of Object.entries(groups)) {
		if (categories[key] || !group) {
			continue;
		}
		categories[key] = group.sort(sortByOrder);
	}

	return { categories, leaderboards: lookup };
}

export const LEADERBOARDS: Record<string, LeaderboardConfig> = {
	farmingweight: {
		order: 1,
	},
	garden: {
		order: 2,
		subpage: '/garden',
	},
	skyblockxp: {
		order: 3,
	},
	chocolate: {
		order: 4,
	},
	participations: {
		order: 5,
	},
	firstplace: {
		order: 6,
	},
	'visitors-accepted': {
		order: 7,
		subpage: '/garden',
	},
	diamondmedals: {
		order: 8,
		icon: '/images/medals/diamond.webp',
	},
	platinummedals: {
		order: 9,
		icon: '/images/medals/platinum.webp',
	},
	goldmedals: {
		order: 10,
		icon: '/images/medals/gold.webp',
	},
	silvermedals: {
		order: 11,
		icon: '/images/medals/silver.webp',
	},
	bronzemedals: {
		order: 12,
		icon: '/images/medals/bronze.webp',
	},
	cactus: {
		order: 1,
		icon: '/images/crops/cactus.png',
	},
	carrot: {
		order: 2,
		icon: '/images/crops/carrot.png',
	},
	cocoa: {
		order: 3,
		icon: '/images/crops/cocoa.png',
	},
	melon: {
		order: 4,
		icon: '/images/crops/melon.png',
	},
	mushroom: {
		order: 5,
		icon: '/images/crops/mushroom.png',
	},
	netherwart: {
		order: 6,
		icon: '/images/crops/netherwart.png',
	},
	potato: {
		order: 7,
		icon: '/images/crops/potato.png',
	},
	pumpkin: {
		order: 8,
		icon: '/images/crops/pumpkin.png',
	},
	sugarcane: {
		order: 9,
		icon: '/images/crops/sugarcane.png',
	},
	wheat: {
		order: 10,
		icon: '/images/crops/wheat.png',
	},
	alchemy: {
		order: 1,
	},
	carpentry: {
		order: 2,
	},
	combat: {
		order: 3,
	},
	enchanting: {
		order: 4,
	},
	farming: {
		order: 5,
	},
	fishing: {
		order: 6,
	},
	foraging: {
		order: 7,
	},
	mining: {
		order: 8,
	},
	runecrafting: {
		order: 9,
	},
	social: {
		order: 10,
	},
	taming: {
		order: 11,
	},
	mite: {
		order: 1,
		icon: '/images/pests/mite.png',
	},
	cricket: {
		order: 2,
		icon: '/images/pests/cricket.png',
	},
	moth: {
		order: 3,
		icon: '/images/pests/moth.png',
	},
	earthworm: {
		order: 4,
		icon: '/images/pests/earthworm.png',
	},
	slug: {
		order: 5,
		icon: '/images/pests/slug.png',
	},
	beetle: {
		order: 6,
		icon: '/images/pests/beetle.png',
	},
	locust: {
		order: 7,
		icon: '/images/pests/locust.png',
	},
	rat: {
		order: 8,
		icon: '/images/pests/rat.png',
	},
	mosquito: {
		order: 9,
		icon: '/images/pests/mosquito.png',
	},
	fly: {
		order: 10,
		icon: '/images/pests/fly.png',
	},
	mouse: {
		order: 11,
		icon: '/images/pests/mouse.png',
	},
	pests: {
		order: 12,
	},
	'cactus-milestone': {
		order: 1,
		icon: '/images/crops/cactus.png',
		subpage: '/garden',
	},
	'carrot-milestone': {
		order: 2,
		icon: '/images/crops/carrot.png',
		subpage: '/garden',
	},
	'cocoa-milestone': {
		order: 3,
		icon: '/images/crops/cocoa.png',
		subpage: '/garden',
	},
	'melon-milestone': {
		order: 4,
		icon: '/images/crops/melon.png',
		subpage: '/garden',
	},
	'mushroom-milestone': {
		order: 5,
		icon: '/images/crops/mushroom.png',
		subpage: '/garden',
	},
	'netherwart-milestone': {
		order: 6,
		icon: '/images/crops/netherwart.png',
		subpage: '/garden',
	},
	'potato-milestone': {
		order: 7,
		icon: '/images/crops/potato.png',
		subpage: '/garden',
	},
	'pumpkin-milestone': {
		order: 8,
		icon: '/images/crops/pumpkin.png',
		subpage: '/garden',
	},
	'sugarcane-milestone': {
		order: 9,
		icon: '/images/crops/sugarcane.png',
		subpage: '/garden',
	},
	'wheat-milestone': {
		order: 10,
		icon: '/images/crops/wheat.png',
		subpage: '/garden',
	},
};

export const REDIRECT_ROUTES: Record<string, string> = {
	'/weight/farming': '/farmingweight',
	'/contests/count': '/participations',
	'/crops/cactus': '/cactus',
	'/crops/carrot': '/carrot',
	'/crops/potato': '/potato',
	'/crops/pumpkin': '/pumpkin',
	'/crops/wheat': '/wheat',
	'/crops/melon': '/melon',
	'/crops/mushroom': '/mushroom',
	'/crops/cocoa': '/cocoa',
	'/crops/sugarcane': '/sugarcane',
	'/crops/netherwart': '/netherwart',
	'/skills/combat': '/combat',
	'/skills/mining': '/mining',
	'/skills/foraging': '/foraging',
	'/skills/fishing': '/fishing',
	'/skills/enchanting': '/enchanting',
	'/skills/alchemy': '/alchemy',
	'/skills/taming': '/taming',
	'/skills/carpentry': '/carpentry',
	'/skills/runecrafting': '/runecrafting',
	'/skills/social': '/social',
	'/skills/farming': '/farming',
};
