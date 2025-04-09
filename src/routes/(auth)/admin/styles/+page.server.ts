import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CreateWeightStyle } from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load = (async ({ parent, locals }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}
}) satisfies PageServerLoad;

export const actions = {
	createStyle: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const body: components['schemas']['CreateStyleRequest'] = {
			name: data.get('name') as string,
			description: data.get('description') as string,
			styleFormatter: 'data',
			data: {
				decal: { start: { x: -400, y: 0 }, end: { x: 1, y: 1 }, crops: {} },
				elements: {
					background: {
						size: { x: 1920, y: 400 },
						fill: '#2c2d31',
						rects: [],
						imageUrl: '',
						radius: 10,
						opacity: 1,
					},
					gradients: [],
					name: {
						fill: '#ffffff',
						fontSize: 100,
						position: { x: 30, y: 0.28 },
						maxWidth: 0.5,
						outline: { width: 12, fill: '#936473' },
					},
					weight: {
						fill: '#ffffff',
						fontSize: 256,
						position: { x: 25, y: 0.88 },
						maxWidth: 0.63,
						maxHeight: 100,
						outline: { width: 15, opacity: 0.9, fill: '#936473' },
					},
					label: {
						fill: '#ffffff',
						fontSize: 80,
						position: { x: 20, y: -0.3 },
						maxWidth: 0.11,
						outline: { width: 10, opacity: 1, fill: '#936473' },
					},
					head: { position: { x: -200, y: 0.5 }, maxHeight: 0.75 },
					badge: { position: { x: 0.62, y: 20 }, maxHeight: 100 },
					rank: {
						fontSize: 75,
						position: { x: 0.78, y: 20 },
						background: { fill: '#c4859e', padding: 22, radius: 10 },
					},
					rankWithBadge: {
						fontSize: 75,
						position: { x: 0.6, y: 20 },
						background: { fill: '#936c7b', padding: 22, radius: 10 },
					},
				},
			},
		};

		if (!body.name) {
			return fail(400, { error: 'Invalid style name.' });
		}

		const { error: e, response } = await CreateWeightStyle(locals.access_token, body);

		if (e) {
			return fail(response.status, { error: e });
		}

		if (!response.ok || e) {
			return fail(response.status, {
				error: e ?? 'Failed to create style',
			});
		}

		return {
			success: true,
		};
	},
};
