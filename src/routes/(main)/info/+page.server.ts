import { getAllWeights, getBadges, type BadgeDto, type WeightsDto } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	const { data: badges } = await getBadges().catch(() => ({ data: [] as BadgeDto[] }));
	const { data: weights } = await getAllWeights().catch(() => ({ data: {} as WeightsDto }));

	setHeaders({
		'Cache-Control': 'public, max-age=3600, s-maxage=3600',
	});

	return {
		badges: badges,
		weights: weights,
	};
}) satisfies PageServerLoad;
