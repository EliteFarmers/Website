import { GetUser, GetUserByIGN } from '$db/database';
import { FetchLeaderboardRank, GetLeaderboardSlice, LeaderboardCategories, LEADERBOARDS } from '$db/leaderboards';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, depends }) => {
	const { category, page } = params;
	let start = params.start ?? '1';

	depends('custom:leaderboard');

	if (!LeaderboardCategories.includes(category)) {
		throw error(404, 'Leaderboard not found');
	}

	let ign: string | undefined;
	let profileId: string | undefined;
	if (start.startsWith('+')) {
		const [player, profile] = start.slice(1).split('-');

		const user = player.length === 32 ? await GetUser(player) : await GetUserByIGN(player);

		if (user) {
			profileId =
				profile.length === 32
					? profile
					: user.skyblock?.profiles.find((p) => p.cute_name === profile)?.profile_id;

			if (!profileId) throw error(404, 'Profile not found');

			const rank = await FetchLeaderboardRank(user.uuid, category, page, profileId);

			if (rank && rank !== -1) {
				start = String(Math.floor((rank - 1) / 20) * 20 + 1);
			}

			ign = user.ign?.toString();
		}
	}

	start = String(Math.max(1, Number(start)));

	const lb = await GetLeaderboardSlice(Number(start) - 1, 20, category, page);

	const categoryEntry = LEADERBOARDS[category];
	const pageEntry = categoryEntry?.pages[page];

	const name = pageEntry?.name ?? categoryEntry?.name ?? 'Leaderboard';

	return {
		lb,
		start: Number(start),
		jump: ign ?? undefined,
		profileId: profileId,
		name,
		formatting: categoryEntry?.format,
	};
};
