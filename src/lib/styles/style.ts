import { z } from 'zod';

export function isValidWeightStyle(data: unknown): data is WeightStyle {
	if (data === null || data === undefined) return false;
	const parse = WeightStyle.safeParse(data);
	return parse.success;
}

export function weightStyleParse(data: unknown) {
	return WeightStyle.safeParse(data);
}

export function isValidLeaderboardStyle(data: unknown): data is LeaderboardStyle {
	if (data === null || data === undefined) return false;
	const parse = LeaderboardStyle.safeParse(data);
	return parse.success;
}

export function leaderboardStyleParse(data: unknown) {
	return LeaderboardStyle.safeParse(data);
}

export const Position = z.object({
	x: z.number(),
	y: z.number(),
});
export type Position = z.infer<typeof Position>;

export const BackgroundRectangle = z.object({
	start: Position,
	end: Position,
	fill: z.string(),
	useEmbedColor: z.boolean().optional(),
	opacity: z.number().optional(),
});
export type BackgroundRectangle = z.infer<typeof BackgroundRectangle>;

export const BackgroundStyle = z.object({
	size: Position.optional(),
	fill: z.string().optional(),
	opacity: z.number().optional(),
	radius: z.number().optional(),
	rects: z.array(BackgroundRectangle).optional(),
	imageUrl: z.string().optional(),
	align: z.enum(['flex-end', 'flex-start', 'center']).optional(),
});
export type BackgroundStyle = z.infer<typeof BackgroundStyle>;

export const BackgroundGradientStop = z.object({
	position: z.number().gte(0).lte(1),
	fill: z.string(),
});
export type BackgroundGradientStop = z.infer<typeof BackgroundGradientStop>;

export const BackgroundGradient = z.object({
	direction: z.object({
		start: Position,
		end: Position,
	}),
	bounds: z
		.object({
			start: Position,
			end: Position,
		})
		.optional(),
	stops: z.array(BackgroundGradientStop),
	opacity: z.number().optional(),
});
export type BackgroundGradient = z.infer<typeof BackgroundGradient>;

export const OutlineStyle = z.object({
	opacity: z.number().optional(),
	fill: z.string().optional(),
	width: z.number().optional(),
});
export type OutlineStyle = z.infer<typeof OutlineStyle>;

export const TextBackgroundStyle = z.object({
	fill: z.string().optional(),
	opacity: z.number().optional(),
	padding: z.number().optional(),
	radius: z.number().optional(),
});
export type TextBackgroundStyle = z.infer<typeof TextBackgroundStyle>;

export const ElementPosition = z.object({
	font: z.string().optional(),
	fontSize: z.number().optional(),
	fill: z.string().optional(),
	position: Position,
	maxWidth: z.number().optional(),
	maxHeight: z.number().optional(),
	outline: OutlineStyle.optional(),
	background: TextBackgroundStyle.optional(),
});
export type ElementPosition = z.infer<typeof ElementPosition>;

export const WeightStyleDecal = z.object({
	start: Position,
	end: Position,
	fill: z.string().optional(),
	imageUrl: z.string().optional(),
	crops: z.record(z.string(), z.string()).optional(),
});
export type WeightStyleDecal = z.infer<typeof WeightStyleDecal>;

export const WeightStyle = z.object({
	decal: WeightStyleDecal.optional(),
	elements: z.object({
		background: BackgroundStyle,
		gradients: z.array(BackgroundGradient).optional(),
		weight: ElementPosition.optional(),
		label: ElementPosition.optional(),
		name: ElementPosition.optional(),
		head: ElementPosition.optional(),
		badge: ElementPosition.optional(),
		rank: ElementPosition.optional(),
		rankWithBadge: ElementPosition.optional(),
	}),
});
export type WeightStyle = z.infer<typeof WeightStyle>;

const LeaderboardStyleText = z.object({
	color: z.string().optional(),
	shadowColor: z.string().optional(),
	shadowOpacity: z.number().optional(),
	fontWeight: z.number().optional(),
});

export type LeaderboardStyleText = z.infer<typeof LeaderboardStyleText>;

const LeaderboardStyleLayer = z.object({
	imageUrl: z.string().optional(),
	imageOpacity: z.string().optional(),
	fillColor: z.string().optional(),
	fillOpacity: z.number().optional(),
	borderColor: z.string().optional(),
	borderOpacity: z.number().optional(),
	align: z.enum(['flex-end', 'flex-start', 'center']).optional(),
});

export const LeaderboardStyle = z.object({
	background: LeaderboardStyleLayer.optional(),
	overlay: LeaderboardStyleLayer.optional(),
	gradientOpacity: z.number().optional(),
	gradientColor: z.string().optional(),
	font: z.string().optional(),
	name: LeaderboardStyleText.optional(),
	score: LeaderboardStyleText.optional(),
	rank: LeaderboardStyleText.optional(),
	subtitle: LeaderboardStyleText.optional(),
});

export type LeaderboardStyle = z.infer<typeof LeaderboardStyle>;
