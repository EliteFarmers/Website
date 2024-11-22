import { GetPlayersRank } from '$lib/api/elite';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

//! Temporary route for SkyHanni users until most have updated to the new route
export const GET = (async ({ params, url }) => {
	const { uuid, profile } = params;

	const next = url.searchParams.get('showNext') ? true : false;

	try {
		const { data } = await GetPlayersRank('farmingweight', uuid, profile, next);

		if (!data) {
			return json({ success: true, rank: -1 });
		}

		return json({
			success: true,
			rank: data.rank,
			next: (data.upcomingPlayers ?? [])[0] ?? undefined,
		});
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		return json({ success: true, rank: -1 });
	}
}) as RequestHandler;
