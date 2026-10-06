import type { PreviewCard } from '$lib/discord-preview';
import { STAT_NAMES, type WeatherIsland, type WeatherWindow } from 'farming-weight';

export function createPreview(
	island: WeatherIsland,
	{ current, next }: { current: WeatherWindow | null; next: WeatherWindow }
): PreviewCard {
	const bonuses = (window: WeatherWindow) => {
		const details = island[window.type];
		return [
			details.bonuses.map((bonus) => `**+${bonus.value}** ${STAT_NAMES[bonus.stat]}`).join(' • '),
			details.specialEffect,
		]
			.filter(Boolean)
			.join('\n');
	};
	return {
		title: `${island.name} Weather`,
		lines: [
			current ? `**Current: ${island[current.type].name}** • Ends <t:${current.end}:R>` : '**Current: Clear**',
			current && bonuses(current),
			`**Next: ${island[next.type].name}** • Starts <t:${next.start}:R>\n<t:${next.start}:f> – <t:${next.end}:t>`,
			bonuses(next),
		],
	};
}
