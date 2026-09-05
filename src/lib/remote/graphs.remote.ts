import { query } from '$app/server';
import { getAccount, getCropGraphs, getSkillGraphs } from '$lib/api';
import { preprocessCropCharts, preprocessSkillCharts, preprocessWeightSeries } from '$lib/utils';
import * as zod from 'zod';

const zodGraphsRange = zod.object({
	playerUuid: zod.string(),
	profileUuid: zod.string(),
	start: zod.number().int().nonnegative(),
	days: zod.number().int().min(1).max(30).optional(),
});

function toNumericRecord(values: Record<string, number | bigint> | undefined): Record<string, number> {
	return Object.fromEntries(Object.entries(values ?? {}).map(([key, value]) => [key, Number(value)]));
}

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

export const getCollectionSnapshots = query(zodGraphsRange, async ({ playerUuid, profileUuid, start, days }) => {
	const { data } = await getCropGraphs(playerUuid, profileUuid, {
		from: BigInt(start),
		days: days ?? 9,
		perDay: 1,
	});

	return (data ?? []).map((point) => ({
		timestamp: Number(point.timestamp),
		cropWeight: Number(point.cropWeight),
		crops: toNumericRecord(point.crops),
		pests: toNumericRecord(point.pests as Record<string, number | bigint> | undefined),
	}));
});

export const getSkillSnapshots = query(zodGraphsRange, async ({ playerUuid, profileUuid, start, days }) => {
	const { data } = await getSkillGraphs(playerUuid, profileUuid, {
		from: BigInt(start),
		days: days ?? 9,
		perDay: 1,
	});

	return (data ?? []).map((point) => ({
		timestamp: Number(point.timestamp),
		skills: toNumericRecord(point.skills),
	}));
});

export const getPlayerGuildData = query(zod.object({ playerUuid: zod.string() }), async ({ playerUuid }) => {
	const result = await getAccount(playerUuid);

	if (!result.ok || !result.data?.playerData) return undefined;
	const guildMember = result.data.playerData.guildMember;

	return {
		guildId: guildMember?.guild?.id ?? undefined,
		guildName: guildMember?.guild?.name ?? undefined,
		expHistory: (guildMember?.expHistory as Record<string, number> | undefined) ?? undefined,
	};
});
