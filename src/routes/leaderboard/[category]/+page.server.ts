import { LeaderboardCategories } from '$db/leaderboards';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const { category } = params;
	const start = url.searchParams.get('start') ?? '1';

	if (LeaderboardCategories.includes(category)) {
		throw error(404);
	}

	const profiles = await fetchProfiles(uuid);

	if (!profiles) {
		return {
			status: 404,
			error: "Hypixel API couldn't be reached.",
		};
	}

	return {
		props: {
			profiles,
		},
	};
}