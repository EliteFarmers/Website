import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_COMMUNITY_INVITE } from '$env/static/public';

export const GET: RequestHandler = () => {
	throw redirect(302, PUBLIC_COMMUNITY_INVITE);
};
