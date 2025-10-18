import { getRecordsInYear } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, params, setHeaders }) => {
	await parent();

	const { year } = params;

	const { data, response } = await getRecordsInYear(+year);

	if (!data?.crops || !response.ok) {
		throw error(404, 'Contest records not found!');
	}

	setHeaders({
		'Cache-Control': 'public, max-age=3600',
	});

	return {
		year: +year,
		crops: data.crops,
	};
}) satisfies PageServerLoad;
