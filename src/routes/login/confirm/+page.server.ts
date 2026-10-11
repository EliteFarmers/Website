import { acceptConfirmation, getConfirmation } from '$lib/api';
import { mdToHtml } from '$lib/md';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const id = url.searchParams.get('id');

	const fallback = loginUrl(url);

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

		redirect(303, loginUrl(url, true));
	},
};

function loginUrl(url: URL, success = false) {
	const queryParams = new URLSearchParams();
	if (success) {
		queryParams.append('success', 'true');
	}
	for (const key of ['redirect', 'attempt', 'first']) {
		const value = url.searchParams.get(key);
		if (value) {
			queryParams.append(key, value);
		}
	}

	return `/login${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}
