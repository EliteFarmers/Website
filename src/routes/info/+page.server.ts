import type { components } from '$lib/api/api';
import { GetAllBadges, GetWeights } from '$lib/api/elite';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	const { data: badges } = await GetAllBadges().catch(() => ({ data: [] }));
	const { data: weights } = await GetWeights().catch(() => ({ data: {} }));

	setHeaders({
		'Cache-Control': 'public, max-age=3600, s-maxage=3600',
	});

	return {
		badges: badges as components['schemas']['BadgeDto'][],
		weights: weights as components['schemas']['WeightsDto'],
	};
}) satisfies PageServerLoad;
