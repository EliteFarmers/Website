import { GetMonthlyContests } from '$lib/api/elite';
import { getSkyblockDate, getTimeStamp } from '$lib/format';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, setHeaders, request }) => {
	const { year, month } = params;

	const timestamp = getTimeStamp(+year - 1, +month - 1, 0);
	const date = getSkyblockDate(timestamp);

	if (date.year !== +year - 1 || date.month !== +month - 1) {
		throw redirect(308, `/contests/${date.year + 1}/${date.month + 1}`);
	}

	if (isNaN(+params.year) || isNaN(+params.month) || +params.year < 1 || +params.month < 1 || +params.month > 12) {
		throw error(400, 'Invalid year or month');
	}

	const { data } = await GetMonthlyContests(+params.year, +params.month, request.headers).catch(() => ({
		data: undefined,
	}));

	if (!data) {
		throw error(500, 'Failed to load contests');
	}

	setHeaders({
		'Cache-Control': 'public, max-age=600',
	});

	return {
		contests: data,
		year: +params.year,
		month: +params.month,
	};
}) satisfies PageServerLoad;
