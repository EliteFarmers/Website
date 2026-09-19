import type { HarvestFeastRotationsDto } from '$lib/api';
import { previewCrop, type PreviewCard } from '$lib/discord-preview';
import { selectHarvestFeastRotations } from '$lib/harvest-feast-rotations';

export function createPreview({ cache }: { cache: { harvestfeast: HarvestFeastRotationsDto } }): PreviewCard {
	const feast = cache.harvestfeast;
	const selection = selectHarvestFeastRotations(feast, Math.floor(Date.now() / 1000));
	const rotations = [...(selection.current ? [selection.current] : []), ...selection.upcoming];
	return {
		title: feast.isGrandFeast ? 'Grand Feast' : 'Upcoming Harvest Feast',
		description: 'Check out the upcoming Harvest Feast and Grand Feast rotations!',
		lines: rotations
			.slice(0, 5)
			.map(
				(rotation) =>
					'<t:' +
					rotation.start +
					':R> • **' +
					rotation.crops.map((crop) => previewCrop(crop)).join(' • ') +
					'**'
			),
	};
}
