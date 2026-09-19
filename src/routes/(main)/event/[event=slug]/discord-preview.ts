import type { EventDetailsDto } from '$lib/api';
import { previewStat, type PreviewCard } from '$lib/discord-preview';

export function createPreview(
	{ event, members }: { event: EventDetailsDto; members: unknown[] },
	url: URL
): PreviewCard {
	const base = url.pathname.replace(/\/leaderboard$/, '');
	const parseTime = (value?: string | null) => (value && /^\d+$/.test(value) ? Number(value) : undefined);
	const start = parseTime(event.startTime);
	const end = parseTime(event.endTime);
	const now = Date.now() / 1000;
	const ended = end !== undefined && end <= now;
	const started = start !== undefined && start <= now;
	const status = ended
		? '**Event ended**'
		: start !== undefined && start > now
			? '**Upcoming event**'
			: started && end !== undefined && end > now
				? '**Event in progress**'
				: undefined;
	return {
		title: event.name + (url.pathname.endsWith('/leaderboard') ? ' • Leaderboard' : ''),
		description: event.description,
		image: event.banner?.url,
		lines: [
			status,
			previewStat('participants', members.length),
			start !== undefined && `**${started ? 'Started' : 'Starts'}:** <t:${start}:f>`,
			end !== undefined && `**${ended ? 'Ended' : 'Ends'}:** <t:${end}:f>`,
		],
		links: [
			{ label: 'View event', path: base },
			{ label: 'Leaderboard', path: base + '/leaderboard' },
		],
	};
}
