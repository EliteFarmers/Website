import { getGuide } from '$lib/api';
import { renderGuideContentForDisplay } from '$lib/guides/render-content.server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, url }) => {
	const { data: guide, response } = await getGuide(params.slug, { draft: url.searchParams.get('draft') === 'true' });

	if (response.status === 404) {
		error(404, 'Guide not found');
	}

	return {
		guide: guide ? await renderGuideContentForDisplay(guide) : guide,
	};
}) satisfies PageServerLoad;
