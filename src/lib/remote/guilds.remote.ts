import { query } from '$app/server';
import { getHypixelGuilds, SortHypixelGuildsBy, type HypixelGuildDetailsDto } from '$lib/api';
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

type GuildListResponse = HypixelGuildDetailsDto[];

export const getHypixelGuildsList = query(getGuildListParams, async (params): Promise<GuildListResponse> => {
	const { data } = await getHypixelGuilds({
		sortBy: params.sortBy,
		descending: params.descending,
		page: params.page,
		pageSize: params.pageSize,
		collection: params.collection,
		skill: params.skill,
	}).catch(() => ({ data: undefined }));

	return data?.guilds ?? [];
});
