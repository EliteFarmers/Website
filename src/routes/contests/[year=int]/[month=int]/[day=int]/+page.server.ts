import { GetContests } from '$lib/api/elite';
import { getSkyblockDate, getTimeStamp } from '$lib/format';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders, request }) => {
	const { year, month, day } = params;

	const daysSinceFirstContestOfTheYear = +day + (+month - 1) * 31 - 2;

	if (daysSinceFirstContestOfTheYear % 3 !== 0) {
		throw redirect(308, `/contests/${+year}/${+month}/${+day - (daysSinceFirstContestOfTheYear % 3)}`);
	}

	const timestamp = getTimeStamp(+year - 1, +month - 1, +day - 1);

	const date = getSkyblockDate(timestamp);
	if (date.year !== +year - 1 || date.month !== +month - 1 || date.day !== +day - 1) {
		throw redirect(308, `/contests/${date.year + 1}/${date.month + 1}/${date.day + 1}`);
	}

	const { data: contests } = await GetContests(timestamp, request.headers).catch(() => ({ data: undefined }));

	if (!contests) {
		throw error(404, 'Contests not found!');
	}

	setHeaders({
		'Cache-Control': 'max-age=600, public',
	});

	return {
		timestamp,
		contests,
	};
};
