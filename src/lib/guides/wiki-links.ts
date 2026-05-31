const WIKI_HOST = 'hypixelskyblock.minecraft.wiki';
const WIKI_SHORTCUT_HOST = 'w.elitesb.gg';

export interface NormalizedWikiLink {
	url: string;
	pageName: string;
}

function decodePageName(slug: string) {
	const page = slug.split('/')[0]?.split('#')[0]?.split('?')[0] ?? '';
	try {
		return decodeURIComponent(page).replaceAll('_', ' ').trim();
	} catch {
		return page.replaceAll('_', ' ').trim();
	}
}

export function normalizeWikiLinkUrl(input: string): NormalizedWikiLink | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		try {
			parsed = new URL(`https://${trimmed}`);
		} catch {
			return null;
		}
	}

	if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
	if (parsed.hostname !== WIKI_HOST && parsed.hostname !== WIKI_SHORTCUT_HOST) return null;
	if (!parsed.pathname.startsWith('/w/')) return null;

	const pageSlug = parsed.pathname.slice('/w/'.length);
	const pageName = decodePageName(pageSlug);
	if (!pageName) return null;

	return {
		url: `https://${WIKI_SHORTCUT_HOST}${parsed.pathname}${parsed.search}${parsed.hash}`,
		pageName,
	};
}
