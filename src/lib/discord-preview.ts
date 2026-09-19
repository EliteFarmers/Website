import { CROP_DISCORD_EMOJIS } from '$lib/constants/crops';
import { PEST_DISCORD_EMOJIS } from '$lib/constants/pests';
import type { ButtonBuilder, ContainerBuilder } from '@discordjs/builders';
import { getCropDisplayName, getCropFromName, getPestName, Pest } from 'farming-weight';

// Exclude the builders from being imported in the browser
const builders = import.meta.env.SSR ? await import('@discordjs/builders') : null;

export interface PreviewContext {
	url: URL;
	path: string;
}

export interface PreviewCard {
	title: string;
	titleEmoji?: string;
	description?: string | null;
	headerLines?: string[];
	lines?: (string | undefined | null | false)[];
	image?: string | null;
	links?: { label: string; path: string }[];
}

export function previewText(value: string | null | undefined, limit = 350): string {
	return (value ?? '')
		.replace(/§[0-9a-fk-or]/gi, '')
		.replace(/<[^>]*>/g, '')
		.replaceAll('—', ' • ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, limit)
		.replace(/([\\`*_{}[\]()<>~|#])/g, '\\$1')
		.replace(/@/g, '@\u200b');
}

export function previewNumber(value: number | bigint | null | undefined): string | undefined {
	if (value == null || !Number.isFinite(Number(value))) return undefined;
	return Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function previewStat(label: string, value: number | bigint | null | undefined) {
	const formatted = previewNumber(value);
	return formatted === undefined ? undefined : `**${formatted}** ${label}`;
}

export function getDiscordCropEmoji(value: string | null | undefined): string {
	const crop = value ? getCropFromName(value) : undefined;
	return crop ? CROP_DISCORD_EMOJIS[crop] : '';
}

export function previewCrop(value: string | null | undefined, label?: string): string {
	const crop = value ? getCropFromName(value) : undefined;
	const name = previewText(label ?? (crop ? getCropDisplayName(crop) : value));
	return crop ? `${CROP_DISCORD_EMOJIS[crop]} ${name}` : name;
}

function resolvePest(value: string | null | undefined): Pest | undefined {
	const name = value?.toLowerCase().replace(/[\s_-]/g, '');
	if (name === 'earthworm') return Pest.Worm;
	return Object.values(Pest).find((pest) => pest.replaceAll('_', '') === name);
}

export function getDiscordPestEmoji(value: string | null | undefined): string {
	const pest = resolvePest(value);
	return pest ? PEST_DISCORD_EMOJIS[pest] : '';
}

export function previewPest(value: string | null | undefined, label?: string): string {
	const pest = resolvePest(value);
	const name = previewText(label ?? (pest ? getPestName(pest) : value));
	return pest ? `${PEST_DISCORD_EMOJIS[pest]} ${name}` : name;
}

function publicUrl(value: string, base: URL) {
	const url = new URL(value, base);
	if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.href.length > 2048) {
		throw new Error('Invalid preview URL');
	}
	return url.href;
}

function serialize(container: ContainerBuilder): string {
	let count = 0;
	const allowed = new Set([1, 2, 9, 10, 11, 12, 14, 17]);
	const buttonKeys = new Set(['type', 'url', 'style', 'label', 'emoji', 'disabled']);

	const clean = (value: unknown): unknown => {
		if (Array.isArray(value)) return value.map(clean);
		if (!value || typeof value !== 'object') return value;
		const object = value as Record<string, unknown>;
		if (typeof object.type === 'number') {
			if (!allowed.has(object.type) || ++count > 40) throw new Error('Unsupported preview components');
			if (object.type === 2 && (object.style !== 5 || !object.url))
				throw new Error('Preview buttons must be links');
		}
		return Object.fromEntries(
			Object.entries(object)
				.filter(([key]) => key !== 'id' && (object.type !== 2 || buttonKeys.has(key)))
				.map(([key, entry]) => [key, clean(entry)])
		);
	};
	return JSON.stringify({ component: clean(container.toJSON()) })
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

export function buildDiscordPreview(card: PreviewCard, context: PreviewContext): string | null {
	if (!builders) return null;
	const { ActionRowBuilder, ButtonBuilder, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } =
		builders;
	const container = new ContainerBuilder().setAccentColor(0x03fc7b);
	const heading = new TextDisplayBuilder().setContent(
		[
			`## ${card.titleEmoji ? `${card.titleEmoji} ` : ''}${previewText(card.title, 150)}`,
			...(card.description ? [previewText(card.description)] : []),
			...(card.headerLines ?? []),
		].join('\n')
	);
	if (card.image) {
		container.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(heading)
				.setThumbnailAccessory(new ThumbnailBuilder().setURL(publicUrl(card.image, context.url)))
		);
	} else container.addTextDisplayComponents(heading);
	const lines = card.lines?.filter((line): line is string => !!line).slice(0, 5);
	if (lines?.length)
		container.addSeparatorComponents((s) => s).addTextDisplayComponents((t) => t.setContent(lines.join('\n')));
	const links = card.links?.length ? card.links.slice(0, 2) : [{ label: 'View on Elite', path: context.path }];
	container.addActionRowComponents(
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			...links.map((link) =>
				new ButtonBuilder()
					.setStyle(5)
					.setLabel(link.label.slice(0, 80))
					.setURL(publicUrl(link.path, context.url))
			)
		)
	);
	return serialize(container);
}
