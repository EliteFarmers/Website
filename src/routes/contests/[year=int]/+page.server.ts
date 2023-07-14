import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (({ params }) => {
	const { year } = params;

	throw redirect(308, `/contests/${year}/1`);
}) satisfies PageServerLoad;
