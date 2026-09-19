import type { EventDetailsDto, PublicGuildDto } from '$lib/api';
import { previewStat, previewText, type PreviewCard } from '$lib/discord-preview';

export function createPreview({ guild, events }: { guild: PublicGuildDto; events: EventDetailsDto[] }): PreviewCard {
	return {
		title: guild.name,
		description: guild.description,
		image: guild.icon?.url,
		lines: [
			previewStat('members', guild.memberCount),
			...events.slice(0, 3).map((event) => '**' + previewText(event.name) + '**'),
		],
	};
}
