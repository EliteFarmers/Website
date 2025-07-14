import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetAnnouncements } from '$lib/api/elite';

export const load = (async () => {
	const { data: announcements = [] } = await GetAnnouncements().catch(() => ({ data: undefined }));

	return {
		announcements: announcements,
	};
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const title = data.get('title') as string;
		const content = data.get('content') as string;

		if (!title || !content) {
			return { error: 'Title and content are required.' };
		}

		// const response = await CreateAnnouncement(locals.access_token, { title, content });

		return { success: true };
	},
};
