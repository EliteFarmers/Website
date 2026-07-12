import { cache } from '$lib/servercache';
import { SIDEBAR_COOKIE_NAME } from '$ui/sidebar/constants';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent, cookies, url }) => {
	await parent();

	const sidebarState = cookies.get(SIDEBAR_COOKIE_NAME);

	return {
		session: locals.session,
		persistSession: locals.persistSession ?? false,
		previewPack: createPreviewPack(url.searchParams.get('previewPack')),
		clearPreviewPackId: getPreviewPackId(url.searchParams.get('clearPreviewPack')),
		cache: {
			events: cache.events,
			announcements: cache.announcements ?? [],
			footer: cache.businessInfo.footer,
			texturepacks: cache.texturepacks,
		},
		sidebar: (sidebarState ?? 'true') === 'true',
		bot: locals.bot ?? false,
		ads: locals.ads ?? true,
		newProducts: locals.cache?.products?.new ?? false,
	};
};

function createPreviewPack(value: string | null) {
	const id = getPreviewPackId(value);
	if (!id) return null;

	return {
		id,
		name: 'Managed Preview',
		version: 'preview',
		description: 'Managed resource pack preview.',
		authors: ['Elite Website Preview'],
		downloadUrl: null,
		supportsCit: false,
		packFormat: null,
		iconDataUrl: null,
		defaultEnabled: false,
		fontUrl: null,
		fontVersion: null,
		source: 'managed-preview' as const,
	};
}

function getPreviewPackId(value: string | null) {
	return value?.startsWith('mprv_') ? value : null;
}
