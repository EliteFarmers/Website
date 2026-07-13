import type { Crumb } from '$lib/hooks/page.svelte';
import BookOpen from '@lucide/svelte/icons/book-open';
import CalendarClock from '@lucide/svelte/icons/calendar-clock';
import CreditCard from '@lucide/svelte/icons/credit-card';
import ExternalLink from '@lucide/svelte/icons/external-link';
import FileText from '@lucide/svelte/icons/file-text';
import Gift from '@lucide/svelte/icons/gift';
import Handshake from '@lucide/svelte/icons/handshake';
import Palette from '@lucide/svelte/icons/palette';
import ServerCog from '@lucide/svelte/icons/server-cog';
import TextSearch from '@lucide/svelte/icons/text-search';
import Trophy from '@lucide/svelte/icons/trophy';
import UserPen from '@lucide/svelte/icons/user-pen';
import Users from '@lucide/svelte/icons/users';

export interface NavItem {
	name: string;
	href: string;
	external?: boolean;
	auth?: boolean;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
	auth?: boolean;
}

export const PROFILE_NAV_PAGES = [
	{
		icon: UserPen,
		name: 'Overview',
		href: '/profile',
	},
	{
		icon: Palette,
		name: 'Settings',
		href: '/profile/settings',
	},
	{
		icon: FileText,
		name: 'My Guides',
		href: '/profile/guides',
	},
	{
		icon: BookOpen,
		name: 'Bookmarks',
		href: '/profile/bookmarks',
	},
	{
		icon: CreditCard,
		name: 'Purchases',
		href: '/profile/purchases',
	},
	{
		icon: Gift,
		name: 'Gifts',
		href: '/profile/gifts',
	},
	{
		icon: ServerCog,
		name: 'Discord Servers',
		href: '/profile/servers',
	},
] as Crumb[];

export const GUILDS_NAV_PAGES = [
	{
		icon: Handshake,
		name: 'Guild Directory',
		href: '/guilds',
	},
] as Crumb[];

export const BROWSE_NAV_PAGES = [
	{
		icon: TextSearch,
		name: 'Server Directory',
		href: '/browse',
	},
] as Crumb[];

export function createGuildNavPages(guildId: string): Crumb[] {
	return [
		...GUILDS_NAV_PAGES,
		{
			icon: Handshake,
			name: 'Overview',
			href: `/guilds/${guildId}`,
		},
		{
			icon: Users,
			name: 'Member Leaderboards',
			href: `/guilds/${guildId}/members`,
		},
	];
}

export function createServerNavPages(serverSlug: string): Crumb[] {
	return [
		...BROWSE_NAV_PAGES,
		{
			icon: ServerCog,
			name: 'Server Overview',
			href: `/server/${serverSlug}`,
		},
		{
			icon: ExternalLink,
			name: 'Join Server',
			href: `/server/${serverSlug}/join`,
		},
	];
}

export function createEventNavPages(eventSlug: string): Crumb[] {
	return [
		...BROWSE_NAV_PAGES,
		{
			icon: CalendarClock,
			name: 'Event Overview',
			href: `/event/${eventSlug}`,
		},
		{
			icon: Users,
			name: 'Membership',
			href: `/event/${eventSlug}/membership`,
		},
		{
			icon: Trophy,
			name: 'Leaderboard',
			href: `/event/${eventSlug}/leaderboard`,
		},
	];
}
