import { acceptConfirmation, getConfirmation } from '$lib/api';
import { mdToHtml } from '$lib/md';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const id = url.searchParams.get('id');
	const attempt = url.searchParams.get('attempt');
	const redirectParam = url.searchParams.get('redirect');

	const queryParams = new URLSearchParams();
	if (redirectParam) {
		queryParams.append('redirect', redirectParam);
	}
	if (attempt) {
		queryParams.append('attempt', attempt);
	}

	const fallback = `/login${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	if (!id) {
		redirect(307, fallback);
	}

	const confirmation = await getConfirmation(+id);
	if (!confirmation.data) {
		redirect(307, fallback);
	}

	confirmation.data.content = (await mdToHtml(confirmation.data.content ?? '')) ?? confirmation.data.content;

	return {
		id: id,
		confirmation: confirmation.data,
		continue: fallback,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	accept: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { response, error: e } = await acceptConfirmation(id);

		if (!response.ok) {
			fail(response.status, e ?? 'Failed to accept confirmation');
		}

		const attempt = url.searchParams.get('attempt');
		const redirectParam = url.searchParams.get('redirect');

		const queryParams = new URLSearchParams();
		queryParams.append('success', 'true');
		if (redirectParam) {
			queryParams.append('redirect', redirectParam);
		}
		if (attempt) {
			queryParams.append('attempt', attempt);
		}

		const fallback = `/login${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

		redirect(303, fallback);
	},
};
