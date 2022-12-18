import { GetUserByIGN } from '$db/database';
import { FetchLeaderboardRank, GetLeaderboardSlice, LeaderboardCategories, LEADERBOARDS } from '$db/leaderboards';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, depends }) => {
	const { category } = params;
	let page = params.page;
	let start = params.start?.split('?')?.[0] ?? '1';
	let ign = url.searchParams.get('jump');

	if (!params.start && page && !isNaN(Number(page))) {
		start = page;
		page = 'DEFAULT';
	}

	depends('custom:leaderboard');

	if (!LeaderboardCategories.includes(category)) {
		throw error(404, 'Leaderboard not found');
	}

	if (ign && ign.length > 0 && ign.length <= 24 && /^[a-zA-Z0-9_]+$/.test(ign)) {
		const player = await GetUserByIGN(ign);

		if (player) {
			ign = player.ign;

			const rank = await FetchLeaderboardRank(player.uuid, category, page);

			if (rank && rank !== -1) {
				start = String(Math.floor((rank - 1) / 20) * 20 + 1);
			}
		}
	}

	start = String(Math.max(1, Number(start)));

	const lb = await GetLeaderboardSlice(Number(start) - 1, 20, category, page);

	const categoryEntry = LEADERBOARDS[category];
	const pageEntry = categoryEntry?.pages[page ?? 'DEFAULT'];

	const name = pageEntry?.name ?? categoryEntry?.name ?? 'Leaderboard';

	return {
		lb,
		start: Number(start),
		jump: ign ?? undefined,
		name,
		formatting: categoryEntry?.format,
	};
}