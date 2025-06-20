import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import type { components } from './api/api';
import { enhance } from '$app/forms';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			});
		},
		easing: cubicOut,
	};
};

export const pending = (node: HTMLFormElement, pending: boolean) => {
	return enhance(node, () => {
		if (pending) return;
		pending = true;
		return async ({ update }) => {
			pending = false;
			update();
		};
	});
};

export function CanManageGuild(
	guild: Partial<components['schemas']['AuthorizedGuildDto']>,
	session?: App.Locals['session']
) {
	if (session?.flags?.admin) return true;
	// Check if the user has the admin role
	if (guild.guild?.adminRole && guild.member?.roles?.includes(guild.guild.adminRole)) return true;

	// Check if the user has the manage guild or admin permission
	if (!guild.permissions) return false;
	const perms = BigInt(guild.permissions);

	const admin = BigInt(0x8);
	const manageGuild = BigInt(0x20);

	// Check if the user has the manage guild or manage events permission
	return (perms & admin) === admin || (perms & manageGuild) === manageGuild;
}

export enum ChannelType {
	GuildText = 0,
	DirectMessage = 1,
	GuildVoice = 2,
	GroupDirectMessage = 3,
	GuildCategory = 4,
	GuildAnnouncement = 5,
	AnnouncementThread = 10,
	PublicThread = 11,
	PrivateThread = 12,
	GuildStage = 13,
	GuildDirectory = 14,
	GuildForum = 15,
}

const CROP_TO_PEST: Partial<Record<string, string>> = {
	cactus: 'mite',
	carrot: 'cricket',
	cocoa: 'moth',
	melon: 'worm',
	mushroom: 'slug',
	wart: 'beetle',
	potato: 'locust',
	pumpkin: 'rat',
	cane: 'mosquito',
	wheat: 'fly',
};

const cropToPest = (crop: string) => {
	return CROP_TO_PEST[crop];
};

export function preprocessCropCharts(crops: components['schemas']['CropCollectionsDataPointDto'][]) {
	return (
		crops
			.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
			.reduce<Record<string, { date: string; value: number; pests: number }[]>>((acc, curr) => {
				for (const [crop, value = 0] of Object.entries(curr.crops ?? {})) {
					acc[crop] ??= [];

					const last = acc[crop].at(-1);
					if ((last && last.value > value) || +(last?.date ?? 0) > +(curr.timestamp ?? 0)) continue;

					acc[crop].push({
						date: (curr.timestamp ?? 0) + '',
						value: value ?? 0,
						pests: curr.pests[cropToPest(crop) as keyof typeof curr.pests] ?? 0,
					});
				}
				return acc;
			}, {}) ?? {}
	);
}

export function preprocessWeightChart(data: components['schemas']['CropCollectionsDataPointDto'][]) {
	return data
		.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
		.map((point) => ({
			date: point.timestamp ?? 0,
			value: point.cropWeight ?? 0,
		}));
}

export enum EventType {
	FarmingWeight = '1',
	Collections = '2',
	Medals = '4',
	Pests = '5',
}

export enum EventMode {
	Solo = '1',
	Teams = '2',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };