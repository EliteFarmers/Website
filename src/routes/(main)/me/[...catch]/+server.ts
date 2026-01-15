import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.session?.uuid) {
		if (locals.session) {
			redirect(307, '/onboarding?redirect=' + encodeURIComponent(url.pathname + url.search + url.hash));
		}
		redirect(307, '/login?redirect=' + encodeURIComponent(url.pathname + url.search + url.hash));
	}

	redirect(307, url.pathname.replace('/me', '/@' + locals.session.uuid + url.search + url.hash));
};
