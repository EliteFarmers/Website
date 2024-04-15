import { GetCropCollectionPoints, GetPlayerRanks } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { PermissionFlags, hasPermission } from '$lib/auth';

export const load = (async ({ parent, locals }) => {
	const { account, profile } = await parent();

	let authorized = false;
	if (locals.discord_access_token && hasPermission(locals.user, PermissionFlags.ViewGraphs)) {
		authorized = true;
	}

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	const { data: ranks } = await GetPlayerRanks(account.id, profile.profileId);
	const { data: crops } = await GetCropCollectionPoints(account.id, profile.profileId).catch(() => ({
		data: undefined,
	}));

	return {
		ranks,
		authorized,
		crops:
			crops
				?.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
				?.reduce<Record<string, { date: string; value: number }[]>>((acc, curr) => {
					for (const [crop, value] of Object.entries(curr.crops ?? {})) {
						acc[crop] ??= [];

						const last = acc[crop].at(-1);
						if ((last && last.value > value) || +(last?.date ?? 0) > +(curr.timestamp ?? 0)) continue;

						acc[crop].push({
							date: (curr.timestamp ?? 0) + '',
							value: value ?? 0,
						});
					}
					return acc;
				}, {}) ?? {},
	};
}) satisfies LayoutServerLoad;
