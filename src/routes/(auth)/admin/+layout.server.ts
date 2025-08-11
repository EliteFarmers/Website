import { getBadges, getStyles } from '$lib/api';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
	setHeaders({
		'Cache-Control': 'no-store',
	});

	const { data: badges } = await getBadges().catch(() => ({ data: undefined }));
	const { data: styles } = await getStyles().catch(() => ({ data: undefined }));

	return {
		badges: badges ?? [],
		styles: styles ?? [],
	};
}) satisfies LayoutServerLoad;
