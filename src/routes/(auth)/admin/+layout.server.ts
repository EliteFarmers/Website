import { GetAllBadges, GetWeightStyles } from '$lib/api/elite';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	setHeaders({
		'Cache-Control': 'no-store',
	});

	const { data: badges } = await GetAllBadges().catch(() => ({ data: undefined }));
	const { data: styles } = await GetWeightStyles().catch(() => ({ data: undefined }));

	return {
		badges: badges ?? [],
		styles: styles ?? [],
	};
}) satisfies LayoutServerLoad;
