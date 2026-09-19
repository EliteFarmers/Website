import type { FullGuideDto } from '$lib/api';
import { previewText, previewStat, type PreviewCard } from '$lib/discord-preview';

export function createPreview({ guide }: { guide?: FullGuideDto | null }): PreviewCard | null {
	if (!guide || guide.isDraft) return null;
	return {
		title: guide.title,
		description: guide.description,
		image: guide.iconSkyblockId
			? '/api/item/' + encodeURIComponent(guide.iconSkyblockId) + '.webp'
			: guide.assets?.find((asset) => asset.image?.url)?.image?.url,
		lines: [
			guide.author?.name && '-# By ' + previewText(guide.author.name),
			guide.tags?.length
				? '**Tags:** ' +
					guide.tags
						.slice(0, 5)
						.map((tag) => previewText(tag, 45))
						.join(' • ')
				: undefined,
			previewStat('views', guide.viewCount),
		],
		links: [
			{ label: 'Read guide', path: '/guides/' + guide.slug },
			{ label: 'Browse guides', path: '/guides' },
		],
	};
}
