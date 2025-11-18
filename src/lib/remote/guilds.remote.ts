import { query } from '$app/server';
import {
	getHypixelGuildMembersLeaderboard,
	getHypixelGuilds,
	searchHypixelGuilds,
	SortHypixelGuildsBy,
	type HypixelGuildDetailsDto,
	type HypixelGuildSearchResultDto,
} from '$lib/api';
import type { GuildMembersLeaderboard } from '$lib/api/elite';
import { cache } from '$lib/servercache';
import * as z from 'zod';

const SORT_VALUES = [
	SortHypixelGuildsBy.memberCount,
	SortHypixelGuildsBy.skyblockExperience,
	SortHypixelGuildsBy.skyblockExperienceAverage,
	SortHypixelGuildsBy.skillLevel,
	SortHypixelGuildsBy.skillLevelAverage,
	SortHypixelGuildsBy.hypixelLevelAverage,
	SortHypixelGuildsBy.slayerExperience,
	SortHypixelGuildsBy.catacombsExperience,
	SortHypixelGuildsBy.farmingWeight,
	SortHypixelGuildsBy.networth,
	SortHypixelGuildsBy.networthAverage,
] as const;

const getGuildListParams = z.object({
	sortBy: z.enum(SORT_VALUES).default(SortHypixelGuildsBy.memberCount),
	descending: z.boolean().default(true),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(30),
	collection: z.string().min(1).optional(),
	skill: z.string().min(1).optional(),
});

type GuildListResponse = {
    guilds: HypixelGuildDetailsDto[];
    total: number | null;
};

export const getHypixelGuildsList = query(getGuildListParams, async (params): Promise<GuildListResponse> => {
	const result = await getHypixelGuilds({
		sortBy: params.sortBy,
		descending: params.descending,
		page: params.page,
		pageSize: params.pageSize,
		collection: params.collection,
		skill: params.skill,
	}).catch(() => undefined);

	if (!result?.ok || !result.data) {
		return { guilds: [], total: null };
	}

	const payload = result.data as { guilds?: HypixelGuildDetailsDto[]; total?: number };
	const headerTotal = result.response.headers.get('x-total-count');
	const bodyTotal = payload.total;
	let total: number | null = null;

	if (headerTotal) {
		const parsed = Number.parseInt(headerTotal, 10);
		if (Number.isFinite(parsed)) {
			total = parsed;
		}
	} else if (typeof bodyTotal === 'number' && Number.isFinite(bodyTotal)) {
		total = bodyTotal;
	}

	return { guilds: payload.guilds ?? [], total };
});

const guildSearchParams = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(30).default(8),
});

export const searchGuilds = query(
	guildSearchParams,
	async ({ query, limit }): Promise<HypixelGuildSearchResultDto[]> => {
		const { data } = await searchHypixelGuilds({ query, limit }).catch(() => ({ data: undefined }));

		return data?.results ?? [];
	}
);

const guildMembersLeaderboardParams = z.object({
	guildId: z.string().min(1),
	leaderboardId: z.string().min(1),
	interval: z.string().min(1).optional(),
	mode: z.enum(['classic', 'ironman', 'island']).optional(),
	removed: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const getGuildMembersLeaderboard = query(
	guildMembersLeaderboardParams,
	async ({ guildId, leaderboardId, interval, mode, removed }): Promise<GuildMembersLeaderboard | undefined> => {
		const { data } = await getHypixelGuildMembersLeaderboard(guildId, leaderboardId, {
			interval,
			mode,
			removed,
		}).catch(() => ({ data: undefined }));

		if (!data) return undefined;

		return {
			...data,
			entries: data.entries.map((entry) => {
				const styleId = entry.meta?.leaderboard?.styleId;
				const style = styleId ? cache.styleLookup[styleId]?.leaderboard : undefined;
				return {
					...entry,
					style,
				};
			}),
		};
	}
);
