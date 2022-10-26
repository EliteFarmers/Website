import type { LeaderboardEntry } from '$db/database';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	const lbFetch = await fetch('/api/leaderboard/weight?limit=10');
	const lb = (await lbFetch.json()) as LeaderboardEntry[];

	setHeaders({
		// Max age of 5 minutes
		'Cache-Control': 'max-age=300',
	});

	return {
		lb: lb,
	};
};
