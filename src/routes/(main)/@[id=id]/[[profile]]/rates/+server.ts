import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	throw redirect(308, url.pathname.replace('/rates', '/fortune') + (url.hash || ''));
};
