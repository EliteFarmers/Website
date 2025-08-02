import { getSkyblockDate } from '$lib/format';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const { timestamp } = params;

	const date = getSkyblockDate(timestamp);

	throw redirect(308, `/contests/${date.year + 1}/${date.month + 1}/${date.day + 1}`);
};
