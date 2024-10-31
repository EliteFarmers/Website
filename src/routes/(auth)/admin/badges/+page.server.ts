import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, formDataSerializer, PATCH, POST } from '$lib/api/elite';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	return {
		user,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	createbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const badgeName = data.get('name') as string;
		const badgeImage = data.get('image') as string;
		const badgeDescription = data.get('description') as string;
		const badgeRequirements = data.get('requirements') as string;
		const tied = data.get('tied') as string;

		const { response } = await POST('/badge', {
			body: {
				Image: badgeImage,
				Name: badgeName,
				Description: badgeDescription,
				Requirements: badgeRequirements,
				TieToAccount: tied === 'on',
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
			bodySerializer: formDataSerializer,
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to create badge' });
		}

		return {
			success: true,
		};
	},
	editbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const badgeId = data.get('badgeId') as string;
		const badgeName = data.get('name') as string;
		const badgeImage = data.get('image') as string;
		const badgeDescription = data.get('description') as string;
		const badgeRequirements = data.get('requirements') as string;

		const { response } = await PATCH('/badge/{badgeId}', {
			params: {
				path: {
					badgeId: badgeId as unknown as number,
				},
			},
			body: {
				Image: badgeImage,
				Name: badgeName,
				Description: badgeDescription,
				Requirements: badgeRequirements,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
			bodySerializer: formDataSerializer,
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to edit badge' });
		}

		return {
			success: true,
		};
	},
	deleteBadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const badgeId = data.get('id') as string;

		const { response } = await DELETE('/badge/{badgeId}', {
			params: {
				path: {
					badgeId: badgeId as unknown as number,
				},
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to delete badge' });
		}

		return {
			success: true,
		};
	},
	adduserbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const playerUuid = data.get('uuid') as string;
		const badgeId = data.get('badgeId') as string;

		const { response } = await POST('/badge/user/{playerUuid}/{badgeId}', {
			params: {
				path: {
					playerUuid,
					badgeId: badgeId as unknown as number,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to add badge.' });
		}

		return {
			success: true,
		};
	},
	deleteuserbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const playerUuid = data.get('uuid') as string;
		const badgeId = data.get('badgeId') as string;

		const { response } = await DELETE('/badge/user/{playerUuid}/{badgeId}', {
			params: {
				path: {
					playerUuid,
					badgeId: badgeId as unknown as number,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to delete badge.' });
		}

		return {
			success: true,
		};
	},
};
