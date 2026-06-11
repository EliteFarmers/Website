import {
	GARDEN_CHIPS,
	type GardenChipId,
	getChipInputLevel,
	getChipInputRarity,
	getChipLevel,
	getChipRarity,
} from '../../constants/chips.js';
import { Stat } from '../../constants/stats.js';
import type { Effect, EffectEnvironment } from '../../effects/types.js';
import type { FarmingPlayer } from '../../player/player.js';
import { FortuneSource } from './base.js';

export class GenericChipSource extends FortuneSource {
	readonly id: string;
	readonly name: string;
	private readonly chipId: GardenChipId;

	constructor(chipId: GardenChipId) {
		super();
		this.chipId = chipId;
		this.id = `chip:${chipId}`;
		this.name = GARDEN_CHIPS[chipId].name;
	}

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = getChipInputLevel(player.options.chips, this.chipId);
		const chipLevel = getChipLevel(level);
		if (chipLevel <= 0) return [];

		const info = GARDEN_CHIPS[this.chipId];
		const stats =
			info.statsPerRarity?.[
				getChipRarity(chipLevel, getChipInputRarity(player.options.chipRarities, this.chipId))
			];
		if (!stats) return [];

		const out: Effect[] = [];
		for (const [statKey, value] of Object.entries(stats) as [Stat, number][]) {
			if (statKey === Stat.Overbloom) continue;
			if (!value) continue;
			out.push({ source: this.name, op: 'add-stat', stat: statKey, value: value * chipLevel });
		}
		return out;
	}
}

export class RarefinderChipSource extends FortuneSource {
	readonly id = 'chip:rarefinder';
	readonly name = GARDEN_CHIPS.rarefinder.name;

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = getChipInputLevel(player.options.chips, 'rarefinder');
		const chipLevel = getChipLevel(level);
		if (chipLevel <= 0) return [];

		const stats =
			GARDEN_CHIPS.rarefinder.statsPerRarity?.[
				getChipRarity(chipLevel, getChipInputRarity(player.options.chipRarities, 'rarefinder'))
			];
		const value = stats?.[Stat.Overbloom];
		if (!value) return [];

		return [
			{
				source: this.name,
				op: 'add-rare-pct',
				value: value * chipLevel,
				scope: { tags: ['overbloom'] },
				relatedStats: [Stat.Overbloom],
				meta: {
					description: 'Normal Overbloom',
					valueDisplay: 'stat',
					valueStat: Stat.Overbloom,
				},
			},
		];
	}
}

export const GARDEN_CHIP_CLASSES = {
	cropshot: new GenericChipSource('cropshot'),
	vermin_vaporizer: new GenericChipSource('vermin_vaporizer'),
	synthesis: new GenericChipSource('synthesis'),
	sowledge: new GenericChipSource('sowledge'),
	mechamind: new GenericChipSource('mechamind'),
	hypercharge: new GenericChipSource('hypercharge'),
	evergreen: new GenericChipSource('evergreen'),
	overdrive: new GenericChipSource('overdrive'),
	quickdraw: new GenericChipSource('quickdraw'),
	rarefinder: new RarefinderChipSource(),
} as const satisfies Record<GardenChipId, FortuneSource>;
