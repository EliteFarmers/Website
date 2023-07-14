import { LEADERBOARDS, LeaderboardType } from '$lib/constants/leaderboards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ setHeaders }) => {
	const leaderboards = LEADERBOARDS;

	const lbs = Object.entries(leaderboards).map(([key, value]) => ({
		id: key,
		...value,
	}));

	const categories = {
		skills: lbs.filter((lb) => lb.type === LeaderboardType.Skill),
		collections: lbs.filter((lb) => lb.type === LeaderboardType.Collection),
		general: lbs.filter((lb) => lb.type === LeaderboardType.Misc),
	};

	setHeaders({
		'Cache-Control': 'max-age=86400, public',
	});

	return {
		categories,
	};
};
