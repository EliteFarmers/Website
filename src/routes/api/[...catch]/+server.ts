import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
const { ELITE_API_URL } = env;

export const GET: RequestHandler = ({ url }) => {
	const newUrl = ELITE_API_URL + url.href.substring(url.origin.length);

	throw redirect(308, newUrl);
};
