import { getSkyblockDate } from '$lib/format';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (({ params, url }) => {
	const { year, month } = params;

	if (+year < 100) {
		throw redirect(308, `/contests/100/6`);
	}

	const maxYear = getSkyblockDate(Date.now() / 1000).year + 1;
	if (+year > maxYear) {
		if (url.pathname.endsWith('records')) {
			throw redirect(308, `/contests/${maxYear}/records`);
		} else {
			throw redirect(308, `/contests/${maxYear}/1`);
		}
	}

	if (!month && !url.pathname.endsWith('records')) {
		throw redirect(308, `/contests/${year}/1`);
	}

	return {};
}) satisfies LayoutServerLoad;
