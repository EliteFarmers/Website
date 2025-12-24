import { query } from '$app/server';
import { getCropGraphs, getSkillGraphs } from '$lib/api';
import { preprocessCropCharts, preprocessSkillCharts, preprocessWeightSeries } from '$lib/utils';
import * as zod from 'zod';

const zodGraphsRange = zod.object({
	playerUuid: zod.string(),
	profileUuid: zod.string(),
	start: zod.number().int().nonnegative(),
	days: zod.number().int().min(1).max(30).optional(),
});

export const getCollectionCharts = query(zodGraphsRange, async ({ playerUuid, profileUuid, start, days }) => {
	const { data } = await getCropGraphs(playerUuid, profileUuid, {
		from: BigInt(start),
		days: days ?? 7,
	});

	return {
		weight: preprocessWeightSeries(data ?? []),
		cropGraph: preprocessCropCharts(data ?? []),
	};
});

export const getSkillCharts = query(zodGraphsRange, async ({ playerUuid, profileUuid, start, days }) => {
	const { data } = await getSkillGraphs(playerUuid, profileUuid, {
		from: BigInt(start),
		days: days ?? 7,
	});

	return {
		skillGraph: preprocessSkillCharts(data ?? []),
	};
});
