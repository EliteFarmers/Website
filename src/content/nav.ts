import type { AuthFlags } from '$lib/api/auth';
import type { Crumb } from '$lib/hooks/page.svelte';
import Badge from '@lucide/svelte/icons/badge';
import BookOpen from '@lucide/svelte/icons/book-open';
import CalendarClock from '@lucide/svelte/icons/calendar-clock';
import Command from '@lucide/svelte/icons/command';
import CreditCard from '@lucide/svelte/icons/credit-card';
import FileArchive from '@lucide/svelte/icons/file-archive';
import FileText from '@lucide/svelte/icons/file-text';
import Gift from '@lucide/svelte/icons/gift';
import Layers from '@lucide/svelte/icons/layers';
import Megaphone from '@lucide/svelte/icons/megaphone';
import Package from '@lucide/svelte/icons/package';
import Palette from '@lucide/svelte/icons/palette';
import ServerCog from '@lucide/svelte/icons/server-cog';
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

export const ADMIN_NAV_PAGES: (Crumb & { exists: (flags: AuthFlags) => boolean })[] = [
	{
		icon: ShieldPlus,
		name: 'Moderators',
		href: '/admin',
		exists: (flags: AuthFlags) => flags.viewAdminPages,
	},
	{
		icon: Megaphone,
		name: 'Announce',
		href: '/admin/announcements',
		exists: (flags: AuthFlags) => flags.admin,
	},
	{
		icon: FileText,
		name: 'Guides',
		href: '/admin/guides',
		exists: (flags: AuthFlags) => flags.moderator,
	},
	{
		icon: Badge,
		name: 'Badges',
		href: '/admin/badges',
		exists: (flags: AuthFlags) => flags.moderator,
	},
	{
		icon: Layers,
		name: 'Categories',
		href: '/admin/categories',
		exists: (flags: AuthFlags) => flags.artist,
	},
	{
		icon: Package,
		name: 'Products',
		href: '/admin/products',
		exists: (flags: AuthFlags) => flags.artist,
	},
	{
		icon: CreditCard,
		name: 'Orders',
		href: '/admin/orders',
		exists: (flags: AuthFlags) => flags.admin,
	},
	{
		icon: Palette,
		name: 'Styles',
		href: '/admin/styles',
		exists: (flags: AuthFlags) => flags.artist,
	},
	{
		icon: CalendarClock,
		name: 'Events',
		href: '/admin/events',
		exists: (flags: AuthFlags) => flags.moderator,
	},
	{
		icon: Command,
		name: 'Actions',
		href: '/admin/actions',
		exists: (flags: AuthFlags) => flags.moderator,
	},
	{
		icon: FileArchive,
		name: 'Exports',
		href: '/admin/data-exports',
		exists: (flags: AuthFlags) => flags.admin,
	},
];
