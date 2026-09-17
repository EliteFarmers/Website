import { CROP_INFO, Crop, PEST_DROP_DEFINITIONS, SPECIAL_CROP_INFO, type PestFarmingPlayer } from 'farming-weight';

/** Output prices needed to compare owned loadouts, without simulating upgrade candidates. */
export function getPestStartupPriceItems(player: PestFarmingPlayer, crop: Crop): string[] {
	const items = new Set<string>([
		crop,
		Crop.Seeds,
		Crop.Mushroom,
		'TOOL_EXP_CAPSULE',
		...Object.values(SPECIAL_CROP_INFO).map((special) => special.id),
		...CROP_INFO[crop].crafts.map((craft) => craft.item),
		...(CROP_INFO[crop].rng ?? []).flatMap((drop) => Object.keys(drop.drops)),
	]);
	for (const definition of Object.values(PEST_DROP_DEFINITIONS)) {
		for (const drop of [...definition.guaranteedDrops, ...(definition.rareDrops ?? [])]) items.add(drop.itemId);
		if (definition.feastRareDrop) items.add(definition.feastRareDrop.itemId);
	}
	for (const phase of Object.values(player.phases)) {
		const env = phase.buildEnvironment(crop);
		const effects = [
			...phase.collectEffects(env),
			...player.getOwnedPets().flatMap((pet) => pet.getEffects(env, phase)),
		];
		for (const effect of effects) {
			if (effect.drop && effect.drop.output !== 'currency') items.add(effect.drop.itemId);
		}
	}
	return [...items];
}
