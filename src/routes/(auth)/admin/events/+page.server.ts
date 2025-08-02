import { DELETE, GetAdminPendingEvents, GetUpcomingEvents, POST } from '$lib/api/elite';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: pending } = await GetAdminPendingEvents(token).catch(() => ({ data: undefined }));
	const { data: upcoming } = await GetUpcomingEvents().catch(() => ({ data: undefined }));

	return {
		user,
		pending: pending ?? [],
		upcoming: upcoming ?? [],
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	approveevent: async ({ request, locals }) => {
		const { access_token: token, session } = locals;

		if (!token || !session?.flags.admin) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const eventId = data.get('eventId') as string;
		const revoke = data.get('approve') === 'false';

		const { response, error: e } = await POST('/admin/events/{eventId}/approve', {
			params: {
				query: {
					approve: !revoke,
				},
				path: {
					eventId: eventId as unknown as number,
				},
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok || e) {
			return fail(response.status, { error: e ?? 'Failed to approve event' });
		}

		return {
			success: true,
		};
	},
	deleteevent: async ({ request, locals }) => {
		const { access_token: token, session } = locals;

		if (!token || !session?.flags.admin) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const eventId = data.get('id') as string;

		const { response } = await DELETE('/admin/events/{eventId}', {
			params: {
				path: {
					eventId: eventId as unknown as number,
				},
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to delete event' });
		}

		return {
			success: true,
		};
	},
};
