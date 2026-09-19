import type { HypixelGuildDto } from '$lib/api';
import { previewStat, type PreviewCard } from '$lib/discord-preview';

export function createPreview({ guild }: { guild: HypixelGuildDto }, url: URL): PreviewCard {
	return {
		title: guild.name + (url.pathname.endsWith('/members') ? ' • Members' : ''),
		description: guild.description,
		lines: [previewStat('members', guild.memberCount), previewStat('guild XP', guild.exp)],
		links: [
			{ label: 'View guild', path: '/guilds/' + guild.id },
			{ label: 'Member rankings', path: '/guilds/' + guild.id + '/members' },
		],
	};
}
