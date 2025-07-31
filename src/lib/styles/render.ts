import { mapPositions } from './maker';
import type { BackgroundStyle, LeaderboardStyle } from './style';
import { createCanvas, Image, loadImage, type SKRSContext2D } from '@napi-rs/canvas';

export async function getLeaderboardBackground(
	data?: LeaderboardStyle | undefined,
	fallback?: BackgroundStyle | undefined
) {
	const backgroundStyle = data?.background;
	if (!backgroundStyle) {
		return;
	}

	const canvas = createCanvas(1920, 400);
	const ctx = canvas.getContext('2d');

	if (backgroundStyle.imageUrl) {
		const image = await loadImage(backgroundStyle.imageUrl).catch(() => null);

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
