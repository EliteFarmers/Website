import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { hasPermission, PermissionFlags } from '$lib/auth';
import type { components } from './api/api';

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

export function CanManageGuild(permissions?: string, user?: App.Locals['user']) {
	if (hasPermission(user, PermissionFlags.Admin)) return true;

	if (!permissions) return false;

	const perms = BigInt(permissions);

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

export function preprocessCropCharts(crops: components['schemas']['CropCollectionsDataPointDto'][]) {
	return (
		crops
			.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
			.reduce<Record<string, { date: string; value: number }[]>>((acc, curr) => {
				for (const [crop, value] of Object.entries(curr.crops ?? {})) {
					acc[crop] ??= [];

					const last = acc[crop].at(-1);
					if ((last && last.value > value) || +(last?.date ?? 0) > +(curr.timestamp ?? 0)) continue;

					acc[crop].push({
						date: (curr.timestamp ?? 0) + '',
						value: value ?? 0,
					});
				}
				return acc;
			}, {}) ?? {}
	);
}
