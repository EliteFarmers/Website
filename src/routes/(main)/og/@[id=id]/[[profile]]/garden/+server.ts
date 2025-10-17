import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, params }) => {
	throw redirect(307, `/og/@${params.id}${params.profile ? `/${params.profile}` : ''}${url.search}`);
};
