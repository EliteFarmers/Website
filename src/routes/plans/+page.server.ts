import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	throw error(501, 'Thank you for your interest, but this page is a WIP, check back soon!');
}) satisfies PageServerLoad;
