import {
	GARDEN_CHIPS,
	type GardenChipId,
	getChipInputLevel,
	getChipLevel,
	getChipRarity,
} from '../../constants/chips.js';
import { Stat } from '../../constants/stats.js';
import type { Effect, EffectEnvironment } from '../../effects/types.js';
import type { FarmingPlayer } from '../../player/player.js';
import { FortuneSource } from './base.js';

/**
 * Generic chip source - turns the chip's `statsPerRarity` table into
 * `add-stat` effects keyed by the chip's level-derived rarity.
 *
 * Skips `Stat.Overbloom` because Overbloom is a virtual stat in the new model,
 * not an additive number; the dedicated {@link RarefinderChipSource} emits the
 * correct `add-rare-pct` effect for that case.
 *
 * Hypercharge's `tempMultiplierPerLevel` and Mechamind/Synthesis's bespoke
 * mechanics are NOT modeled here - they remain in the legacy temp-fortune /
 * tool exp pipelines and are wired in at the calculator level.
 */
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
		const stats = info.statsPerRarity?.[getChipRarity(chipLevel)];
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

/**
 * Rarefinder Chip - global Overbloom contributor. The legacy implementation
 * surfaces this as a flat `Stat.Overbloom` value (2/2.5/3 by rarity); in the
 * effect model it becomes an `add-rare-pct` with a global Overbloom scope and
 * `relatedStats: [Stat.Overbloom]`, which the resolver consumes both as a
 * scalar contribution to the virtual Overbloom stat AND as an additive percent
 * to the rare-drop pipeline.
 */
export class RarefinderChipSource extends FortuneSource {
	readonly id = 'chip:rarefinder';
	readonly name = GARDEN_CHIPS.rarefinder.name;

	getEffects(player: FarmingPlayer, _env: EffectEnvironment): Effect[] {
		const level = getChipInputLevel(player.options.chips, 'rarefinder');
		const chipLevel = getChipLevel(level);
		if (chipLevel <= 0) return [];

		const stats = GARDEN_CHIPS.rarefinder.statsPerRarity?.[getChipRarity(chipLevel)];
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

/**
 * Class registry of every garden chip keyed by chip id. Hypercharge,
 * Synthesis, Mechamind, Evergreen, Overdrive, Quickdraw have no stat or
 * rare-pct contribution; they're either bespoke (temp-fortune multiplier,
 * tool-exp multiplier) or progress-only and intentionally emit `[]`.
 */
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
