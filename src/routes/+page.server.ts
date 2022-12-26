import { GetLeaderboardSlice } from '$db/leaderboards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {

	const lb = await GetLeaderboardSlice(0, 10, 'weight', 'farming');

	return {
		lb,
	};
};
