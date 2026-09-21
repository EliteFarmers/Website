import type { NameCardStyleDataDto, NameCardLayout, WeightStyleElementDto } from '$lib/api';

export type CardText = Omit<WeightStyleElementDto, 'glass'> & {
	glass?: Partial<NonNullable<WeightStyleElementDto['glass']>> | null;
};
export type Card = Omit<NameCardStyleDataDto, 'layout' | 'elements' | 'gradients'> & {
	layout?: Partial<NameCardLayout> | null;
	gradients?: Array<
		Omit<NonNullable<NameCardStyleDataDto['gradients']>[number], 'bounds'> & {
			bounds?: NonNullable<NameCardStyleDataDto['gradients']>[number]['bounds'] | null;
		}
	> | null;
	elements: Partial<Record<'name' | 'rank' | 'weight' | 'label', CardText | null>> & {
		avatar?: Partial<NonNullable<NameCardStyleDataDto['elements']['avatar']>> | null;
	};
};
export const textDefaults = { name: 60, rank: 56, weight: 180, label: 28 } as const;
export type TextElement = keyof typeof textDefaults;

export function boundedScale(value: number | null | undefined, fallback = 1) {
	return Math.min(1.25, Math.max(0.75, Number.isFinite(value) ? value! : fallback));
}

export function nameCardLayout(card: Card) {
	const saved = card.layout;
	return {
		preset: ['classic', 'mirrored', 'centered'].includes(saved?.preset ?? '') ? saved!.preset : 'classic',
		alignment: ['start', 'center', 'end'].includes(saved?.alignment ?? '') ? saved!.alignment : 'start',
		spacing: ['compact', 'normal', 'relaxed'].includes(saved?.spacing ?? '') ? saved!.spacing : 'normal',
		avatarScale: boundedScale(saved?.avatarScale),
		...(Object.fromEntries(
			Object.entries(textDefaults).map(([name, size]) => [
				`${name}Scale`,
				boundedScale(
					saved?.[`${name}Scale` as 'nameScale'],
					boundedScale((card.elements[name as TextElement]?.fontSize ?? size) / size)
				),
			])
		) as Record<`${TextElement}Scale`, number>),
	};
}

export function coordinate(value: number, size: number) {
	const pixels = value >= -1 && value <= 1 ? value * size : value;
	return value < 0 ? size + pixels : pixels;
}

export function boundsStyle(start: { x: number; y: number }, end: { x: number; y: number }) {
	const x = coordinate(start.x, 1920),
		y = coordinate(start.y, 400);
	const endX = coordinate(end.x, 1920),
		endY = coordinate(end.y, 400);
	return `left:${Math.min(x, endX) / 19.2}%;top:${Math.min(y, endY) / 4}%;width:${Math.abs(endX - x) / 19.2}%;height:${Math.abs(endY - y) / 4}%;`;
}

function alpha(color: string | null | undefined, opacity = 1) {
	return `color-mix(in srgb, ${color ?? '#000000'} ${Math.min(1, Math.max(0, opacity)) * 100}%, transparent)`;
}

export function textStyle(element: CardText | null | undefined) {
	if (!element) return '';
	let css = `font-family:${element.font ?? 'inherit'};color:${element.fill ?? 'inherit'};`;
	if (element.background) {
		const b = element.background;
		css += `background:${alpha(b.fill, b.opacity ?? 1)};--text-padding:${Math.min(0.5, (b.padding ?? 0) / 48)}em;padding:var(--text-padding);border-radius:${(b.radius ?? 0) / 48}em;`;
	}
	if (element.outline?.width)
		css += `-webkit-text-stroke:${Math.min(0.12, element.outline.width / 48)}em ${alpha(element.outline.fill, element.outline.opacity ?? 1)};paint-order:stroke fill;`;
	if (element.glass) {
		const g = element.glass;
		const tint = alpha(g.tintColor ?? '#fff', g.tintOpacity ?? 0.2);
		const highlight = alpha(g.highlightColor ?? '#fff', g.highlightOpacity ?? 0.8);
		css += `color:transparent;background-clip:text;-webkit-background-clip:text;background-image:linear-gradient(${g.highlightAngle ?? -20}deg,${tint} ${(g.highlightPosition ?? 0.25) * 100}%,${highlight} ${((g.highlightPosition ?? 0.25) + (g.highlightSize ?? 0.35)) * 100}%,${tint} 100%);-webkit-text-stroke:${g.rimWidth ?? 0.04}em ${alpha(g.rimColor ?? '#fff', g.rimOpacity ?? 0.55)};filter:drop-shadow(${g.shadowOffsetX ?? 0}em ${g.shadowOffsetY ?? 0.06}em ${g.shadowBlur ?? 0.12}em ${alpha(g.shadowColor, g.shadowOpacity ?? 0.35)});`;
	}
	return css;
}

export function weightText(weight: number) {
	return Number.isFinite(weight) ? weight.toLocaleString('en-US', { maximumFractionDigits: 3 }) : '0';
}

export function rankText(rank: number | undefined) {
	return rank && rank > 0 ? `#${rank.toLocaleString('en-US')}` : '';
}
