import BookOpen from '@lucide/svelte/icons/book-open';
import Gem from '@lucide/svelte/icons/gem';
import Handshake from '@lucide/svelte/icons/handshake';
import Home from '@lucide/svelte/icons/home';
import Info from '@lucide/svelte/icons/info';
import Newspaper from '@lucide/svelte/icons/newspaper';
import TextSearch from '@lucide/svelte/icons/text-search';
import Ticket from '@lucide/svelte/icons/ticket';
import Trophy from '@lucide/svelte/icons/trophy';
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
		title: 'Guilds',
		href: '/guilds',
		icon: Handshake as unknown as Component,
	},
	{
		title: 'Browse',
		href: '/browse',
		icon: TextSearch as unknown as Component,
	},
	{
		title: 'Gems',
		href: '/gems',
		icon: Gem as unknown as Component,
	},
	{
		title: 'Articles',
		href: '/articles',
		icon: Newspaper as unknown as Component,
	},
	{
		title: 'Guides',
		href: '/guides',
		icon: BookOpen as unknown as Component,
	},
	{
		title: 'Info',
		href: '/info',
		icon: Info as unknown as Component,
	},
];
