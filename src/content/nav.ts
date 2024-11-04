export interface NavItem {
	title: string;
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
		title: 'Home',
		href: '/',
	},
	{
		title: 'Info',
		href: '/info',
	},
	{
		title: 'Browse',
		href: '/browse',
	},
	{
		title: 'Contests',
		href: '/contests',
	},
	{
		title: 'Top Players',
		href: '/leaderboard',
	},
	{
		title: 'Shop',
		href: '/shop',
	},
] as NavItem[];

export const PROFILE_NAV_PAGES = [
	{
		title: 'Overview',
		href: '/profile',
	},
	{
		title: 'Settings',
		href: '/profile/settings',
	},
	{
		title: 'Discord Servers',
		href: '/profile/servers',
	},
] as NavItem[];

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
				title: 'Login',
				href: '/login',
			},
		],
		auth: false,
	},
] as NavGroup[];

export const SHOP_NAV_PAGES = [
	{
		title: 'Overview',
		href: '/shop',
	},
	{
		title: 'Premium',
		href: '/shop/premium',
	},
	{
		title: 'Weight Styles',
		href: '/shop/styles',
	},
	{
		title: 'Manage Account',
		href: '/profile/settings',
		auth: true,
	},
] as NavItem[];

export const ADMIN_NAV_PAGES = [
	{
		title: 'Moderators',
		href: '/admin',
	},
	{
		title: 'Badges',
		href: '/admin/badges',
	},
	{
		title: 'Products',
		href: '/admin/products',
	},
	{
		title: 'Events',
		href: '/admin/events',
	},
	{
		title: 'Actions',
		href: '/admin/actions',
	},
] as NavItem[];
