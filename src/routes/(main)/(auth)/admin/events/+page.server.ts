import { deleteEventAdmin, getPendingEvents, getUpcomingEvents, setEventApproval } from '$lib/api';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { access_token: token, session } = locals;

	if (!session || !session.perms.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: pending } = await getPendingEvents().catch(() => ({ data: undefined }));
	const { data: upcoming } = await getUpcomingEvents().catch(() => ({ data: undefined }));

	return {
		user: locals.user,
		pending: pending ?? [],
		upcoming: upcoming ?? [],
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	approveevent: async ({ request, locals }) => {
		const { access_token: token, session } = locals;

		if (!token || !session?.perms.admin) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const eventId = data.get('eventId') as string;
		const revoke = data.get('approve') === 'false';

		const { response, error: e } = await setEventApproval(eventId, {
			approve: !revoke,
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

		if (!token || !session?.perms.admin) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const eventId = data.get('id') as string;
		const guildId = data.get('guildId') as string;

		const { response } = await deleteEventAdmin(guildId, eventId);

		if (!response.ok) {
			return fail(500, { error: 'Failed to delete event' });
		}

		return {
			success: true,
		};
	},
};
