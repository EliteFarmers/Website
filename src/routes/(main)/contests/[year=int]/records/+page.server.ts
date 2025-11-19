import { getRecordsInYear } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, params }) => {
	await parent();

	const { year } = params;

	const { data, response } = await getRecordsInYear(+year);

	if (!data?.crops || !response.ok) {
		throw error(404, 'Contest records not found!');
	}

	return {
		year: +year,
		crops: data.crops,
	};
}) satisfies PageServerLoad;
