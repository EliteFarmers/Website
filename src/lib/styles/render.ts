import type { WeightStyleWithDataDtoImageRefs } from '$lib/api/schemas';
import { createCanvas, type Image, loadImage, type SKRSContext2D } from '@napi-rs/canvas';
import { mapPositions } from './maker';
import type { BackgroundStyle, LeaderboardStyle } from './style';

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 400;

// Ordered from largest to smallest for picking the best fit
const SIZE_VARIANTS: { name: string; width: number }[] = [
	{ name: 'full', width: 1920 },
	{ name: 'large', width: 1280 },
	{ name: 'medium', width: 800 },
	{ name: 'small', width: 400 },
];

function resolveImageUrl(
	imageKey: string | undefined,
	imageRefs: WeightStyleWithDataDtoImageRefs | undefined,
	targetWidth: number
): string | undefined {
	if (!imageKey) return undefined;

	const ref = imageRefs?.[imageKey];
	if (!ref) return imageKey;

	// Pick the smallest source that is >= the target width, or the largest available
	for (const variant of SIZE_VARIANTS) {
		const source = ref.sources[variant.name];
		if (source && source.width >= targetWidth) {
			return source.url;
		}
	}

	// Fallback to the largest available source, then the ref url
	for (const variant of SIZE_VARIANTS) {
		const source = ref.sources[variant.name];
		if (source) return source.url;
	}

	return ref.url || imageKey;
}

export async function getLeaderboardBackground(
	data?: LeaderboardStyle | undefined,
	fallback?: BackgroundStyle | undefined,
	width?: number,
	imageRefs?: WeightStyleWithDataDtoImageRefs
) {
	const backgroundStyle = data?.background;
	if (!backgroundStyle) {
		return;
	}

	const w = width ?? DEFAULT_WIDTH;
	const h = Math.round((w / DEFAULT_WIDTH) * DEFAULT_HEIGHT);
	const canvas = createCanvas(w, h);
	const ctx = canvas.getContext('2d');

	if (backgroundStyle.imageUrl) {
		const url = resolveImageUrl(backgroundStyle.imageUrl, imageRefs, w);
		const image = url ? await loadImage(url).catch(() => null) : null;

		return drawBackground(ctx, backgroundStyle, image);
	}

	if (!fallback) {
		return;
	}

	const fallbackImg = fallback?.imageUrl ? await loadImage(fallback.imageUrl).catch(() => null) : null;
	return drawBackground(ctx, fallback, fallbackImg);
}

export function drawBackground(ctx: SKRSContext2D, background: BackgroundStyle, img?: Image | null) {
	if (background.fill) {
		ctx.fillStyle = background.fill;
		ctx.globalAlpha = background.opacity ?? 1;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	if (img) {
		ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	for (const rect of background.rects ?? []) {
		ctx.fillStyle = rect.fill;
		ctx.globalAlpha = rect.opacity ?? 1;

		const { x1, y1, width, height } = mapPositions(ctx.canvas, rect.start, rect.end);
		ctx.fillRect(x1, y1, width, height);
	}

	// Get as image buffer
	return ctx.canvas.toBuffer('image/webp');
}
