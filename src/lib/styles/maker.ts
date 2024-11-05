import {
	BackgroundGradient,
	BackgroundStyle,
	ElementPosition,
	Position,
	WeightStyleDecal,
	WeightStyle,
} from '$lib/styles/style.js';
import { getCropFromName } from 'farming-weight';
import type { components } from '$lib/api/api.js';

export interface CustomFormatterOptions {
	account?: components['schemas']['MinecraftAccountDto'];
	profile?: components['schemas']['FarmingWeightDto'];
	badgeUrl?: string;
	weightRank?: number;
	data?: WeightStyle;
	head?: HTMLImageElement;
}

export async function createFromData(
	canvas: HTMLCanvasElement,
	{
		account = { name: 'Example Account', id: undefined },
		profile = { totalWeight: Math.random() * 5000 + 1000 },
		weightRank = -1,
		badgeUrl = '',
		data,
	}: CustomFormatterOptions
) {
	if (!data) {
		console.error('No data provided!');
		return null;
	}

	const ign = account.name || 'Example Account';
	const uuid = account.id ?? ['MHF_Steve', 'MHF_Alex'][Math.random() > 0.5 ? 1 : 0];

	let result = '';
	const rWeight = Math.round((profile.totalWeight ?? 0) * 100) / 100;

	if (rWeight > 1) {
		result = rWeight.toLocaleString();
	} else if (rWeight === -1) {
		result = 'Zero!';
	} else {
		result = rWeight.toString();
	}

	// Load images and avatar

	const images = [
		data.elements?.background?.imageUrl ? loadImage(data.elements.background.imageUrl).catch(() => null) : null,
		data.elements.head ? loadImage(`https://mc-heads.net/head/${uuid}/left`).catch(() => null) : null,
		badgeUrl !== '' ? loadImage(badgeUrl).catch(() => null) : null,
		getDecalImage(profile, data.decal),
	];

	const [backgroundImg, avatar, badge, decal] = await Promise.all(images);

	if ((!backgroundImg && data.elements.background.imageUrl) || (data.elements.head && !avatar)) {
		// return ErrorEmbed('Failed to load images!').setDescription(
		// 	'Please report this if it continues to happen!'
		// );

		console.error('Images no loads!');
	}

	const backgroundStyle = data.elements.background;

	canvas.width = data?.elements?.background?.size?.x ?? 1920;
	canvas.height = data?.elements?.background?.size?.y ?? 400;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return null;
	}

	// Clip the corners, draw background and decal, then restore the clip
	ctx.save();
	CreateRoundCornerPath(ctx, 0, 0, canvas.width, canvas.height, backgroundStyle?.radius ?? 5);
	ctx.clip();

	drawBackground(ctx, backgroundStyle, backgroundImg);
	drawDecal(ctx, decal, data.decal);

	// Draw gradients
	if (data.elements.gradients?.length) {
		for (const gradient of data.elements.gradients) {
			drawGradient(ctx, gradient);
		}
	}

	// Restore the clip
	ctx.restore();

	// Draw avatar
	if (avatar && data.elements.head) {
		const { x, y } = getPosition(canvas, data.elements.head);
		const avatarSize = getHeight(canvas, data.elements.head);
		const xOffset = x - avatarSize / 2;
		const yOffset = y - avatarSize / 2;

		ctx.drawImage(avatar, xOffset, yOffset, avatarSize, avatarSize);
		ctx.restore();
	}

	// Draw weight text
	if (data.elements.weight) {
		const position = drawText(ctx, result, data.elements.weight);

		const label = data.elements.label;
		if (label) {
			const { x } = mapPosition(canvas, label.position, position);
			const y = getValue(label.position.y, canvas.height);

			const { height } = drawText(ctx, 'Farming', { ...label, position: { x, y } });
			drawText(ctx, 'Weight', { ...label, position: { x, y: y + height + 10 } }, undefined, false);
		}
	}

	// Draw name text
	if (data.elements.name) {
		drawText(ctx, ign, data.elements.name);
	}

	// Draw badge
	if (badge && data.elements.badge) {
		const { x, y } = getPosition(canvas, data.elements.badge);
		const badgeHeight = getHeight(canvas, data.elements.badge);

		ctx.save();
		CreateRoundCornerPath(ctx, x, y, badgeHeight * 3, badgeHeight, 10);
		ctx.clip();

		ctx.drawImage(badge, x, y, badgeHeight * 3, badgeHeight);
		ctx.restore();
		// debugDot(ctx, x, y);
	}

	// Draw rank text
	if (data.elements.rank && weightRank !== -1) {
		const rank = badge && data.elements.rankWithBadge ? data.elements.rankWithBadge : data.elements.rank;

		if (rank.background) {
			drawBackgroundText(ctx, '#' + weightRank.toString(), rank, true);
		} else {
			drawText(ctx, '#' + weightRank.toString(), rank, true);
		}
	}
}

function drawBackground(ctx: CanvasRenderingContext2D, background: BackgroundStyle, img?: CanvasImageSource | null) {
	ctx.save();

	if (background.fill) {
		ctx.fillStyle = background.fill;
		ctx.globalAlpha = background.opacity ?? 1;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	if (img) {
		ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	// const embedColor = settings?.features?.embedColor ? '#' + settings.features.embedColor : undefined;

	for (const rect of background.rects ?? []) {
		ctx.fillStyle = /*rect.useEmbedColor && embedColor ? embedColor :*/ rect.fill;
		ctx.globalAlpha = rect.opacity ?? 1;

		const { x1, y1, width, height } = mapPositions(ctx.canvas, rect.start, rect.end);
		ctx.fillRect(x1, y1, width, height);
	}

	ctx.restore();
}

function drawGradient(ctx: CanvasRenderingContext2D, gradient: BackgroundGradient) {
	const { bounds, opacity = 0.6, direction } = gradient;

	ctx.save();
	const { x1: startX, y1: startY, x2: endX, y2: endY } = mapPositions(ctx.canvas, direction.start, direction.end);
	const grad = ctx.createLinearGradient(startX, startY, endX, endY);

	for (const stop of gradient.stops) {
		grad.addColorStop(stop.position, stop.fill);
	}

	ctx.fillStyle = grad;
	ctx.globalAlpha = opacity;

	if (bounds) {
		const { x1, y1, width, height } = mapPositions(ctx.canvas, bounds.start, bounds.end);
		ctx.fillRect(x1, y1, width, height);
	} else {
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	ctx.restore();
}

function adjustFontSize(ctx: CanvasRenderingContext2D, text: string, element: ElementPosition) {
	let fontSize = element.fontSize ?? 100;
	const font = 'sans-serif';
	ctx.font = `${fontSize}px ${font}`;

	if (element.maxWidth) {
		const maxWidth = getWidth(ctx.canvas, element);
		do {
			fontSize -= 2;
			ctx.font = `${fontSize}px ${font}`;
		} while (fontSize > 0 && ctx.measureText(text).width > maxWidth);
	}
}

interface FinalSize {
	x: number;
	y: number;
	width: number;
	height: number;
}

function drawText(
	ctx: CanvasRenderingContext2D,
	text: string,
	element: ElementPosition,
	flippedAnchor = false,
	adjust = true
): FinalSize {
	if (adjust) {
		adjustFontSize(ctx, text, element);
	}

	ctx.globalAlpha = 1;
	ctx.fillStyle = element.fill ?? '#FFFFFF';

	if (element.outline) {
		return drawStrokedText(ctx, text, element);
	} else {
		let { x, y } = getPosition(ctx.canvas, element);
		const measured = ctx.measureText(text);

		if (flippedAnchor) {
			x -= measured.width + (element.background?.padding ?? 0);
			y +=
				measured.actualBoundingBoxAscent +
				measured.actualBoundingBoxDescent +
				(element.background?.padding ?? 0);
		}

		// debugDot(ctx, x, y);
		ctx.fillText(text, x, y);

		return {
			x,
			y,
			width: measured.width + (element.background?.padding ?? 0) * 2,
			height:
				measured.actualBoundingBoxAscent +
				measured.actualBoundingBoxDescent +
				(element.background?.padding ?? 0) * 2,
		};
	}
}

function drawBackgroundText(
	ctx: CanvasRenderingContext2D,
	text: string,
	element: ElementPosition,
	flippedAnchor = false
) {
	adjustFontSize(ctx, text, element);

	let { x: bgX, y: bgY } = getPosition(ctx.canvas, element);
	// debugDot(ctx, bgX, bgY);

	const measured = ctx.measureText(text);
	const padding = element.background?.padding ?? 0;

	const width = measured.width + padding * 2;
	const height = measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent + padding * 2;

	bgY -= height - padding * 2;

	if (flippedAnchor) {
		// Move the anchor to the top right corner
		bgY += height - padding * 2;
		bgX -= width;
	}

	// debugDot(ctx, bgX, bgY);

	ctx.save();

	ctx.fillStyle = element.background?.fill ?? '#000000';
	ctx.globalAlpha = element.background?.opacity ?? 0.8;

	CreateRoundCornerPath(ctx, bgX, bgY, width, height, element.background?.radius ?? 5);
	ctx.clip();

	ctx.fillRect(bgX, bgY, width, height);
	ctx.globalAlpha = 1;

	ctx.restore();

	drawText(ctx, text, element, true);
}

// function debugDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
// 	ctx.save();
// 	ctx.fillStyle = '#ff00ff';
// 	ctx.fillRect(x - 10, y - 10, 20, 20);
// 	ctx.restore();
// }

function mapPosition(canvas: HTMLCanvasElement, position: Position, offset?: FinalSize) {
	return offset
		? {
				x: offset.x + offset.width + getValue(position.x, canvas.width),
				y: offset.y - offset.height + getValue(position.y, canvas.height),
		  }
		: {
				x: getValue(position.x, canvas.width),
				y: getValue(position.y, canvas.height),
		  };
}

function mapPositions(canvas: HTMLCanvasElement, start: Position, end: Position, offset?: FinalSize) {
	const positions = offset
		? {
				x1: offset.x + offset.width + getValue(start.x, canvas.width),
				y1: offset.y - offset.height + getValue(start.y, canvas.height),
				x2: offset.x + offset.width + getValue(end.x, canvas.width),
				y2: offset.y - offset.height + getValue(end.y, canvas.height),
				width: 0,
				height: 0,
		  }
		: {
				x1: getValue(start.x, canvas.width),
				y1: getValue(start.y, canvas.height),
				x2: getValue(end.x, canvas.width),
				y2: getValue(end.y, canvas.height),
				width: 0,
				height: 0,
		  };

	positions.width = Math.abs(positions.x2 - positions.x1);
	positions.height = Math.abs(positions.y2 - positions.y1);

	return positions;
}

function getPosition(canvas: HTMLCanvasElement, element: ElementPosition, padding = false) {
	const result = mapPosition(canvas, element.position);

	if (padding && element.background?.padding) {
		result.x -= element.background.padding;
		result.y -= element.background.padding;
	}

	return result;
}

function getWidth(canvas: HTMLCanvasElement, element: ElementPosition) {
	return element.maxWidth ? getValue(element.maxWidth, canvas.width) : 0;
}

function getHeight(canvas: HTMLCanvasElement, element: ElementPosition) {
	return element.maxHeight ? getValue(element.maxHeight, canvas.height) : 0;
}

function getValue(provided: number, max: number) {
	const pixels = provided <= 1 && provided >= -1 ? provided * max : provided;

	if (provided >= 0) {
		return pixels;
	} else {
		return max + pixels;
	}
}

function drawStrokedText(ctx: CanvasRenderingContext2D, text: string, element: ElementPosition): FinalSize {
	const { x, y } = getPosition(ctx.canvas, element);

	// Adapted from the solutions by @Simon Sarris and @Jackalope
	// https://stackoverflow.com/questions/7814398/a-glow-effect-on-html5-canvas

	ctx.save();
	ctx.strokeStyle = element.outline?.fill ?? '#000000';
	ctx.lineWidth = element.outline?.width ?? 16;
	ctx.lineJoin = 'round';
	ctx.miterLimit = 2;

	ctx.globalAlpha = element.outline?.opacity ?? 0.8;
	ctx.strokeText(text, x, y);
	ctx.globalAlpha = 1;

	const measured = ctx.measureText(text);

	ctx.fillText(text, x, y);
	ctx.restore();

	return {
		x,
		y,
		width: measured.width + (element.background?.padding ?? 0) * 2,
		height:
			measured.actualBoundingBoxAscent +
			measured.actualBoundingBoxDescent +
			(element.background?.padding ?? 0) * 2,
	};
}

function getDecalImage(weight: components['schemas']['FarmingWeightDto'], decal?: WeightStyleDecal) {
	if (!decal?.crops) {
		return decal?.imageUrl ? loadImage(decal.imageUrl) : null;
	}

	const crops = weight.cropWeight;
	if (!crops) {
		if (decal.imageUrl) {
			return loadImage(decal.imageUrl);
		}
		const options = Object.values(decal.crops);
		return loadImage(options[Math.floor(Math.random() * options.length)]);
	}

	const topCollection = Object.entries(crops).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0][0];
	const crop = getCropFromName(topCollection);

	if (!crop) {
		if (decal.imageUrl) {
			return loadImage(decal.imageUrl);
		}
		const options = Object.values(decal.crops);
		return loadImage(options[Math.floor(Math.random() * options.length)]);
	}

	const url = Object.entries(decal.crops ?? {}).find(([key]) => getCropFromName(key) === crop)?.[1] ?? decal.imageUrl;

	return url ? loadImage(url) : decal.imageUrl ? loadImage(decal.imageUrl) : null;
}

function drawDecal(ctx: CanvasRenderingContext2D, image: CanvasImageSource | null, decal?: WeightStyleDecal) {
	if (!image || !decal) return;

	const { x1, y1, width, height } = mapPositions(ctx.canvas, decal.start, decal.end);
	ctx.drawImage(image, x1, y1, width, height);
}

function CreateRoundCornerPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	cornerRadius: number
) {
	ctx.beginPath();
	ctx.moveTo(x + cornerRadius, y);
	ctx.lineTo(x + width - cornerRadius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
	ctx.lineTo(x + width, y + height - cornerRadius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
	ctx.lineTo(x + cornerRadius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
	ctx.lineTo(x, y + cornerRadius);
	ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
	ctx.closePath();
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = url;
	});
}
