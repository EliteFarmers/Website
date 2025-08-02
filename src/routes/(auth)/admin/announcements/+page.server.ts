import type { components } from '$lib/api/api';
import { CreateAnnouncement, GetAnnouncements } from '$lib/api/elite';
import { reloadCachedItems } from '$lib/servercache';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
		const type = data.get('type') as components['schemas']['AnnouncementType'] | undefined;
		const expiresAt = data.get('expiresAt') as string | undefined;
		const targetLabel = data.get('label') as string | undefined;
		const targetUrl = data.get('targetUrl') as string | undefined;

		if (!title || !content || !expiresAt) {
			return { error: 'Title, content, and expiration date are required.' };
		}

		const body = {
			title,
			content,
			type: type || 'other',
			targetLabel: targetLabel || 'Read More',
			targetUrl: targetUrl || '/',
			createdAt: new Date().toISOString(),
			expiresAt: new Date(expiresAt + '+00:00').toISOString(),
		} satisfies components['schemas']['CreateAnnouncementDto'];

		const { response, error: e } = await CreateAnnouncement(locals.access_token, body);

		if (!response.ok || e) {
			return fail(response.status, { error: e ?? 'Unknown error' });
		}

		await reloadCachedItems();

		return { success: true };
	},
};
