import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (!locals.session?.uuid) {
		if (locals.session) {
			redirect(307, '/onboarding?redirect=' + encodeURIComponent(url.pathname + url.search));
		}
		redirect(307, '/login?redirect=' + encodeURIComponent(url.pathname + url.search));
	}

	redirect(307, url.pathname.replace('/me', '/@' + locals.session.uuid + url.search));
};
