export type ResponsiveImageSource = {
	url?: string | null;
	width?: number | null;
};

export type ResponsiveImageSources = Record<string, ResponsiveImageSource> | null | undefined;

export const GUIDE_IMAGE_SIZES = 'auto, (min-width: 1024px) 760px, calc(100vw - 2rem)';

export function sortedImageSources(sources: ResponsiveImageSources) {
	return Object.values(sources ?? {})
		.filter((source): source is { url: string; width: number } => {
			return Boolean(source?.url) && typeof source?.width === 'number' && source.width > 0;
		})
		.sort((a, b) => a.width - b.width);
}

export function buildImageSrcset(sources: ResponsiveImageSources) {
	const entries = sortedImageSources(sources);
	return entries.length ? entries.map((source) => `${source.url} ${source.width}w`).join(', ') : undefined;
}

export function getLargestImageSourceUrl(sources: ResponsiveImageSources) {
	return sortedImageSources(sources).at(-1)?.url;
}
