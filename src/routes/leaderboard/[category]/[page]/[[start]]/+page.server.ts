import { GetUser, GetUserByIGN } from '$db/database';
import { FetchLeaderboardRank, GetLeaderboardSlice, LeaderboardCategories, LEADERBOARDS } from '$db/leaderboards';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, depends, setHeaders }) => {
	const { category, page } = params;
	let start = params.start ?? '1';

	depends('custom:leaderboard');

	if (!LeaderboardCategories.includes(category)) {
		throw error(404, 'Leaderboard not found');
	}

	let ign: string | undefined;
	let uuid: string | undefined;
	let profileId: string | undefined;
	let profileName: string | undefined;
	let playerRank: number | undefined;

	if (start.startsWith('+')) {
		const [player, profile] = start.slice(1).split('-');

		const user = player.length === 32 ? await GetUser(player) : await GetUserByIGN(player);

		if (user) {
			const profileData = user.skyblock?.profiles.find((p) =>
				profile ? p.profile_id === profile || p.cute_name === profile : p.selected
			);
			profileId = profileData?.profile_id ?? profileId;
			profileName = profileData?.cute_name;

			if (!profileId || profileId.length !== 32)
				throw error(404, "Couldn't find a leaderboard entry for that player and profile!");

			const rank = await FetchLeaderboardRank(category, page, user.uuid, profileId);

			if (rank && rank !== -1) {
				start = String(Math.floor((rank - 1) / 20) * 20 + 1);
			}

			ign = user.ign?.toString();
			uuid = user.uuid;
			playerRank = rank;
		}
	}

	let startNum = Math.max(1, Number(start));

	if (isNaN(startNum)) {
		startNum = 1;
	}

	const lb = await GetLeaderboardSlice(startNum - 1, 20, category, page);

	const categoryEntry = LEADERBOARDS[category];
	const pageEntry = categoryEntry?.pages[page];

	const name = pageEntry?.name ?? categoryEntry?.name ?? 'Leaderboard';

	setHeaders({
		'Cache-Control': `max-age=${LEADERBOARD_UPDATE_INTERVAL / 1000}, public`,
	});

	return {
		lb,
		start: startNum,
		jump: ign ?? undefined,
		userUUID: uuid ?? undefined,
		profileId: profileId,
		profileName: profileName,
		playerRank: playerRank,
		name,
		formatting: categoryEntry?.format,
		lbName: pageEntry?.name ?? 'Default',
	};
};
