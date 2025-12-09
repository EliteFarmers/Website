import HeartHandshake from '@lucide/svelte/icons/heart-handshake';
import History from '@lucide/svelte/icons/history';
import ServerCog from '@lucide/svelte/icons/server-cog';
import TicketX from '@lucide/svelte/icons/ticket-x';
import UserRound from '@lucide/svelte/icons/user-round';
import Weight from '@lucide/svelte/icons/weight';

export const INFO_CATEGORIES = [
	{
		title: 'Account',
		slug: 'account',
		icon: UserRound,
	},
	{
		title: 'Farming Weight',
		slug: 'weight',
		icon: Weight,
	},
	{
		title: 'Server Management',
		slug: 'servers',
		icon: ServerCog,
	},
	{
		title: 'Badges',
		slug: 'badges',
		icon: TicketX,
	},
	{
		title: 'Credits',
		slug: 'credits',
		icon: HeartHandshake,
	},
	{
		title: 'Recap',
		slug: 'recap',
		icon: History,
	},
];
