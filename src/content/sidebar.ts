import Trophy from '@lucide/svelte/icons/trophy';
import Home from '@lucide/svelte/icons/home';
import Info from '@lucide/svelte/icons/info';
import TextSearch from '@lucide/svelte/icons/text-search';
import Ticket from '@lucide/svelte/icons/ticket';
import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
import type { Component } from 'svelte';

export const SIDEBAR_NAV = [
	{
		title: 'Home',
		href: '/',
		icon: Home as unknown as Component,
	},
	{
		title: 'Contests',
		href: '/contests',
		icon: Ticket as unknown as Component,
	},
	{
		title: 'Top Players',
		href: '/leaderboard',
		icon: Trophy as unknown as Component,
	},
	{
		title: 'Browse',
		href: '/browse',
		icon: TextSearch as unknown as Component,
	},
	{
		title: 'Shop',
		href: '/shop',
		icon: ShoppingCart as unknown as Component,
	},
	{
		title: 'Info',
		href: '/info',
		icon: Info as unknown as Component,
	},
];
