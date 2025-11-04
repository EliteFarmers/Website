import type { Crumb } from '$lib/hooks/page.svelte';
import Badge from '@lucide/svelte/icons/badge';
import CalendarClock from '@lucide/svelte/icons/calendar-clock';
import Command from '@lucide/svelte/icons/command';
import Layers from '@lucide/svelte/icons/layers';
import Megaphone from '@lucide/svelte/icons/megaphone';
import Package from '@lucide/svelte/icons/package';
import Palette from '@lucide/svelte/icons/palette';
import ServerCog from '@lucide/svelte/icons/server-cog';
import Settings from '@lucide/svelte/icons/settings';
import ShieldPlus from '@lucide/svelte/icons/shield-plus';
import UserPen from '@lucide/svelte/icons/user-pen';

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

export const NAV_PAGES = [
	{
		name: 'Home',
		href: '/',
	},
	{
		name: 'Info',
		href: '/info',
	},
	{
		name: 'Browse',
		href: '/browse',
	},
	{
		name: 'Contests',
		href: '/contests',
	},
	{
		name: 'Top Players',
		href: '/leaderboard',
	},
	{
		name: 'Shop',
		href: '/shop',
	},
	{
		name: 'Gems',
		href: '/gems',
	},
] as NavItem[];

export const PROFILE_NAV_PAGES = [
	{
		icon: UserPen,
		name: 'Overview',
		href: '/profile',
	},
	{
		icon: Settings,
		name: 'Settings',
		href: '/profile/settings',
	},
	{
		icon: ServerCog,
		name: 'Discord Servers',
		href: '/profile/servers',
	},
] as Crumb[];

export const MOBILE_NAV = [
	{
		title: 'Main Pages',
		items: NAV_PAGES,
	},
	{
		title: 'Player Profile',
		items: PROFILE_NAV_PAGES,
		auth: true,
	},
	{
		title: 'Player Profile',
		items: [
			{
				name: 'Login',
				href: '/login',
			},
		],
		auth: false,
	},
] as NavGroup[];

export const SHOP_NAV_PAGES = [
	{
		name: 'Overview',
		href: '/shop',
	},
	{
		name: 'Premium',
		href: '/shop/premium',
	},
	{
		name: 'Weight Styles',
		href: '/shop/styles',
	},
	{
		name: 'Manage Account',
		href: '/profile/settings',
		auth: true,
	},
] as NavItem[];

export const ADMIN_NAV_PAGES = [
	{
		icon: ShieldPlus,
		name: 'Moderators',
		href: '/admin',
	},
	{
		icon: Megaphone,
		name: 'Announce',
		href: '/admin/announcements',
	},
	{
		icon: Badge,
		name: 'Badges',
		href: '/admin/badges',
	},
	{
		icon: Layers,
		name: 'Categories',
		href: '/admin/categories',
	},
	{
		icon: Package,
		name: 'Products',
		href: '/admin/products',
	},
	{
		icon: Palette,
		name: 'Styles',
		href: '/admin/styles',
	},
	{
		icon: CalendarClock,
		name: 'Events',
		href: '/admin/events',
	},
	{
		icon: Command,
		name: 'Actions',
		href: '/admin/actions',
	},
] as Crumb[];
