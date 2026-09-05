import { form, getRequestEvent, query } from '$app/server';
import {
	addJacobLeaderboardExcludedTimespan,
	banParticipationFromJacobLeaderboard,
	banPlayerFromJacobLeaderboard,
	createGuildJacobLeaderboard,
	deleteGuildJacobLeaderboard,
	getContestsInMonth,
	getUserGuild,
	removeJacobLeaderboardExcludedTimespan,
	sendGuildJacobFeature,
	unbanParticipationFromJacobLeaderboard,
	unbanPlayerFromJacobLeaderboard,
	updateGuildJacobLeaderboard,
	type ContestBracketsDto,
	type JacobContestDto,
	type CropRecords,
} from '$lib/api';
import { CanManageGuild } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { SkyBlockTime } from 'farming-weight';
import { z } from 'zod';

// Utility to get and check guild permissions
async function getGuild(guildId: string, session?: App.Locals['session']) {
	const guild = await getUserGuild(guildId)
		.then((guild) => guild.data ?? undefined)
		.catch(() => undefined);

	if (!guild) throw error(404, 'Guild not found');

	const hasPerms = CanManageGuild(guild, session);
	if (!hasPerms) throw error(403, 'You do not have permission to edit this guild.');

	if (!guild.guild?.features?.jacobLeaderboardEnabled) {
		throw error(402, 'This guild does not have the Jacob Leaderboard feature enabled.');
	}

	return guild;
}

export const getJacobMedalBrackets = query(
	z.object({
		months: z.number().int().min(1).max(12),
	}),
	async ({ months }) => {
		const current = SkyBlockTime.now;
		const currentMonth = (current.year - 1) * 12 + (current.month - 1);
		const responses = await Promise.allSettled(
			Array.from({ length: months }, async (_, offset) => {
				const absoluteMonth = currentMonth - offset;
				const year = Math.floor(absoluteMonth / 12) + 1;
				const month = (absoluteMonth % 12) + 1;
				const response = await getContestsInMonth(year, month);
				return response.ok ? response.data : undefined;
			})
		);

		const successfulMonths = responses.flatMap((response) =>
			response.status === 'fulfilled' && response.value ? [response.value] : []
		);
		if (successfulMonths.length === 0) {
			return { error: 'Failed to fetch bracket data. Please try again later.' };
		}

		const medalKeys = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;
		const totals = new Map<
			string,
			{ sums: ContestBracketsDto; counts: Record<(typeof medalKeys)[number], number> }
		>();
		let contestCount = 0;

		for (const monthData of successfulMonths) {
			for (const contests of Object.values(monthData)) {
				for (const contest of contests as JacobContestDto[]) {
					contestCount++;
					const aggregate = totals.get(contest.crop) ?? {
						sums: { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 },
						counts: { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 },
					};
					for (const medal of medalKeys) {
						const value = Number(contest.brackets[medal] ?? 0);
						if (value <= 0) continue;
						aggregate.sums[medal] += value;
						aggregate.counts[medal]++;
					}
					totals.set(contest.crop, aggregate);
				}
			}
		}

		const brackets = Object.fromEntries(
			[...totals.entries()].map(([crop, aggregate]) => [
				crop,
				Object.fromEntries(
					medalKeys.map((medal) => [
						medal,
						aggregate.counts[medal] > 0 ? Math.round(aggregate.sums[medal] / aggregate.counts[medal]) : 0,
					])
				) as unknown as ContestBracketsDto,
			])
		);

		return {
			data: {
				brackets,
				contestCount,
				monthsLoaded: successfulMonths.length,
			},
		};
	}
);

const leaderboardSchema = z.object({
	title: z.string().min(1).max(64),
	sendToChannelId: z.string().min(1).optional(),
	enableUpdates: z.boolean().optional().default(false),
	mentionRoleId: z.string().optional(),
	updatesChannelId: z.string().optional(),
	tinyUpdatesPing: z.boolean().optional().default(false),
	requiredRoleId: z.string().optional(),
	blockedRoleId: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

type BasicResult = { success?: true; error?: string };

export const createJacobLeaderboardForm = form(leaderboardSchema, async (data): Promise<BasicResult> => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const startCutoff = data.startDate ? Math.floor(new Date(data.startDate).getTime() / 1000) : null;
	const endCutoff = data.endDate ? Math.floor(new Date(data.endDate).getTime() / 1000) : null;

	const body = {
		id: (parseInt(guildId) + Math.floor(Math.random() * 1000000)).toString(),
		title: data.title,
		channelId: data.sendToChannelId || undefined,
		updateChannelId: data.enableUpdates ? data.updatesChannelId || undefined : undefined,
		updateRoleId: data.enableUpdates ? data.mentionRoleId || undefined : undefined,
		pingForSmallImprovements: data.enableUpdates ? data.tinyUpdatesPing : false,
		startCutoff: startCutoff as unknown as bigint | null,
		endCutoff: endCutoff as unknown as bigint | null,
		requiredRole: data.requiredRoleId || undefined,
		blockedRole: data.blockedRoleId || undefined,
	};

	const { response, error: e } = await createGuildJacobLeaderboard(guildId, body).catch((e) => {
		console.log(e);
		throw error(500, 'Internal Server Error');
	});

	if (!response.ok || e) {
		return { error: (typeof e === 'string' ? e : e?.message) ?? 'Failed to create leaderboard!' };
	}

	return {
		success: true,
	};
});

export const editJacobLeaderboardForm = form(
	leaderboardSchema.extend({ id: z.string() }),
	async (data): Promise<BasicResult> => {
		const { locals, params } = getRequestEvent();
		const guildId = params.id as string;
		if (!locals.session || !guildId || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await getGuild(guildId, locals.session);
		const feature = guild.guild?.features?.jacobLeaderboard;
		if (!feature) throw error(404, 'Jacob Leaderboard feature not found');

		const existing = feature.leaderboards?.find((lb) => lb.id === data.id);
		if (!existing) return { error: 'Leaderboard not found' };

		const startCutoff = data.startDate ? Math.floor(new Date(data.startDate).getTime() / 1000) : null;
		const endCutoff = data.endDate ? Math.floor(new Date(data.endDate).getTime() / 1000) : null;

		const updated = {
			title: data.title,
			channelId: data.sendToChannelId || undefined,
			updateChannelId: data.enableUpdates ? data.updatesChannelId || undefined : undefined,
			updateRoleId: data.enableUpdates ? data.mentionRoleId || undefined : undefined,
			pingForSmallImprovements: data.enableUpdates ? data.tinyUpdatesPing : false,
			startCutoff: startCutoff as unknown as bigint | null,
			endCutoff: endCutoff as unknown as bigint | null,
			requiredRole: data.requiredRoleId || undefined,
			blockedRole: data.blockedRoleId || undefined,
		};

		const { response, error: e } = await updateGuildJacobLeaderboard(guildId, data.id, updated).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return { error: (typeof e === 'string' ? e : e?.message) ?? 'Failed to update leaderboard!' };
		}

		return {
			success: true,
		};
	}
);

export const duplicateJacobLeaderboardForm = form(z.object({ id: z.string() }), async (data) => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const guild = await getGuild(guildId, locals.session);
	const feature = guild.guild?.features?.jacobLeaderboard;
	if (!feature) throw error(404, 'Jacob Leaderboard feature not found');

	const existing = feature.leaderboards?.find((lb) => lb.id === data.id);
	if (!existing) return { error: 'Leaderboard not found' };

	const newId = (parseInt(guildId) + Math.floor(Math.random() * 1000000)).toString();
	const title = `${existing.title ?? 'Leaderboard'} (Copy)`;
	const safeTitle = title.length > 64 ? title.slice(0, 64) : title;

	const startCutoff =
		existing.startCutoff === undefined || existing.startCutoff === null
			? null
			: existing.startCutoff === -1n
				? null
				: Number(existing.startCutoff);
	const endCutoff =
		existing.endCutoff === undefined || existing.endCutoff === null
			? null
			: existing.endCutoff === -1n
				? null
				: Number(existing.endCutoff);

	const body = {
		id: newId,
		title: safeTitle,
		channelId: existing.channelId,
		updateChannelId: existing.updateChannelId,
		updateRoleId: existing.updateRoleId,
		pingForSmallImprovements: existing.pingForSmallImprovements ?? false,
		startCutoff: startCutoff as unknown as bigint | null,
		endCutoff: endCutoff as unknown as bigint | null,
		requiredRole: existing.requiredRole,
		blockedRole: existing.blockedRole,
	};

	const { response, error: e } = await createGuildJacobLeaderboard(guildId, body).catch((e) => {
		console.log(e);
		throw error(500, 'Internal Server Error');
	});

	if (!response.ok || e) {
		return { error: e ?? 'Failed to duplicate leaderboard!' };
	}

	return {
		success: true,
	};
});

export const removeJacobLeaderboardForm = form(z.object({ id: z.string() }), async (data) => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const { response, error: e } = await deleteGuildJacobLeaderboard(guildId, data.id).catch((e) => {
		console.log(e);
		throw error(500, 'Internal Server Error');
	});

	if (!response.ok || e) {
		return { error: e ?? 'Failed to delete leaderboard!' };
	}

	return {
		success: true,
	};
});

export const sendJacobLeaderboardForm = form(z.object({ id: z.string() }), async (data) => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const { response, error: e } = await sendGuildJacobFeature(guildId, data.id).catch((e) => {
		console.log(e);
		throw error(500, 'Internal Server Error');
	});

	if (!response.ok || e) {
		throw error(response.status, e ?? 'Failed to send leaderboard!');
	}

	return {
		success: true,
	};
});

export const clearJacobLeaderboardForm = form(z.object({ id: z.string() }), async (data) => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const guild = await getGuild(guildId, locals.session);
	const feature = guild.guild?.features?.jacobLeaderboard;
	const lbIndex = feature?.leaderboards?.findIndex((lb) => lb.id === data.id) ?? -1;
	const lb = feature?.leaderboards?.[lbIndex];

	if (!feature || !lb?.crops || lbIndex === -1) return { error: 'Leaderboard not found' };

	// Reset all fields in lb.crops to empty arrays
	for (const crop in lb.crops) {
		lb.crops[crop as keyof CropRecords] = [];
	}

	const { response, error: e } = await updateGuildJacobLeaderboard(guildId, lb.id, lb).catch((e) => {
		console.log(e);
		throw error(500, 'Internal Server Error');
	});

	if (!response.ok || e) {
		return { error: e ?? 'Failed to clear leaderboard!' };
	}

	return {
		success: true,
	};
});

export const banJacobParticipationForm = form(
	z.object({
		uuid: z.string(),
		crop: z.string(),
		time: z.string(),
	}),
	async (data) => {
		const { locals, params } = getRequestEvent();
		const guildId = params.id as string;
		if (!locals.session || !guildId || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const { response, error: e } = await banParticipationFromJacobLeaderboard(guildId, {
			timestamp: data.time,
			crop: data.crop,
			uuid: data.uuid,
		}).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return { error: e ?? 'Failed to ban participation!' };
		}

		return {
			success: true,
		};
	}
);

export const unbanJacobParticipationForm = form(z.object({ participationId: z.string() }), async (data) => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const { response, error: e } = await unbanParticipationFromJacobLeaderboard(guildId, data.participationId).catch(
		(e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		}
	);

	if (!response.ok || e) {
		return { error: e ?? 'Failed to unban participation!' };
	}

	return {
		success: true,
	};
});

export const banJacobTimespan = form(
	z.object({
		startTime: z.string(),
		endTime: z.string(),
		reason: z.string().optional(),
	}),
	async (data) => {
		const { locals, params } = getRequestEvent();
		const guildId = params.id as string;
		if (!locals.session || !guildId || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const start = new Date(data.startTime);
		const end = new Date(data.endTime);

		if (isNaN(start.getTime())) return { error: 'Invalid date: startDate' };
		if (isNaN(end.getTime())) return { error: 'Invalid date: endDate' };

		const span = {
			start: Math.floor(start.getTime() / 1000),
			end: Math.floor(end.getTime() / 1000),
			reason: data.reason,
		};

		const { response, error: e } = await addJacobLeaderboardExcludedTimespan(guildId, span).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return { error: e ?? 'Failed to ban timespan!', problem: e };
		}

		return {
			success: true,
		};
	}
);

export const unbanJacobTimespan = form(
	z.object({
		startTime: z.string(),
		endTime: z.string(),
	}),
	async (data) => {
		const { locals, params } = getRequestEvent();
		const guildId = params.id as string;
		if (!locals.session || !guildId || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const { response, error: e } = await removeJacobLeaderboardExcludedTimespan(
			guildId,
			data.startTime,
			data.endTime
		).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return { error: e ?? 'Failed to unban timespan!' };
		}

		return {
			success: true,
		};
	}
);

export const banJacobLeaderboardPlayer = form(z.object({ uuid: z.string() }), async (data) => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const { response, error: e } = await banPlayerFromJacobLeaderboard(guildId, { playerUuid: data.uuid }).catch(
		(e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		}
	);

	if (!response.ok || e) {
		return { error: e ?? 'Failed to ban player!' };
	}

	return {
		success: true,
	};
});

export const unbanJacobLeaderboardPlayer = form(z.object({ uuid: z.string() }), async (data) => {
	const { locals, params } = getRequestEvent();
	const guildId = params.id as string;
	if (!locals.session || !guildId || !locals.access_token) {
		throw error(401, 'Unauthorized');
	}

	const { response, error: e } = await unbanPlayerFromJacobLeaderboard(guildId, data.uuid).catch((e) => {
		console.log(e);
		throw error(500, 'Internal Server Error');
	});

	if (!response.ok || e) {
		return { error: e ?? 'Failed to unban player!' };
	}

	return {
		success: true,
	};
});
