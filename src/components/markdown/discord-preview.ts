import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(metadata: { title: string; description: string }): PreviewCard {
	return { title: metadata.title, description: metadata.description, image: '/favicon.webp' };
}
