import type { HarvestFeastRotationsDto } from '$lib/api';
import { previewCrop, type PreviewCard } from '$lib/discord-preview';
import { getNextHarvestFeastWindow, selectHarvestFeastRotations } from '$lib/harvest-feast-rotations';

export function createPreview({ cache }: { cache: { harvestfeast: HarvestFeastRotationsDto } }): PreviewCard {
	const feast = cache.harvestfeast;
	const now = Math.floor(Date.now() / 1000);
	const selection = selectHarvestFeastRotations(feast, now);
	const crops = (rotation: NonNullable<typeof selection.current>) =>
		'**' + rotation.crops.map((crop) => previewCrop(crop)).join(' • ') + '**';
	return {
		title: feast.isGrandFeast ? 'Grand Feast' : 'Upcoming Harvest Feast',
		description: 'Check out the current and upcoming Harvest Feast and Grand Feast rotations!',
		lines: [
			selection.current
				? `**Current rotation** • Ends <t:${selection.current.end}:R>\n${crops(selection.current)}`
				: `**Next Harvest Feast** • Starts <t:${selection.upcoming[0]?.start ?? getNextHarvestFeastWindow(now).start}:R>`,
			...selection.upcoming.slice(0, 4).map((rotation) => `Starts <t:${rotation.start}:R> • ${crops(rotation)}`),
		],
	};
}
