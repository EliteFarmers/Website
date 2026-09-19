import type { PreviewCard } from '$lib/discord-preview';
export function createPreview(data: {
	ign: string;
	year: number;
	profileName: string;
	playerUuid: string;
}): PreviewCard {
	return {
		title: data.ign + ' • ' + data.year + ' Recap',
		description: 'A year of SkyBlock progress on ' + data.profileName + '.',
		image: 'https://skins.mcstats.com/bust/' + data.playerUuid,
	};
}
