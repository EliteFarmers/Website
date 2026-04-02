import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	redirect(307, `/shop/${params.sku}`);
}) satisfies PageServerLoad;
