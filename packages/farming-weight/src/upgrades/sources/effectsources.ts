import { Stat } from '../../constants/stats.js';
import type { Effect, EffectEnvironment } from '../../effects/types.js';
import { statsToEffects } from '../../items/sources/effects-util.js';
import type { FarmingPlayer } from '../../player/player.js';
import { CROP_FORTUNE_SOURCES } from './cropsources.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';
import { GENERAL_FORTUNE_SOURCES } from './generalsources.js';

function getItemFamily(info: object | undefined): string | undefined {
	if (!info || !('family' in info)) return undefined;
	const { family } = info;
	return typeof family === 'string' ? family : undefined;
}

function effectsFromSourceStats<T extends object>(source: DynamicFortuneSource<T>, ctx: T): Effect[] {
	const stats: Partial<Record<Stat, number>> = {};

	for (const stat of Object.values(Stat)) {
		let value = 0;
		if (source.currentStat) {
			value = source.currentStat(ctx, stat) ?? 0;
		} else if (source.current && stat === Stat.FarmingFortune) {
			value = source.current(ctx) ?? 0;
		}

		if (value) stats[stat] = (stats[stat] ?? 0) + value;
	}

	return [...statsToEffects(stats, source.name), ...(source.calculationEffects?.(ctx) ?? [])];
}

export function collectGeneralFortuneSourceEffects(player: FarmingPlayer): Effect[] {
	const effects: Effect[] = [];

	for (const source of GENERAL_FORTUNE_SOURCES) {
		if (source.name === 'Attribute Shards' || source.name === 'Garden Chips') continue;

		if (player.activeAccessories.some((accessory) => accessory.info.name === source.name)) continue;
		const sourceInfo = source.info?.(player);
		const sourceFamily = getItemFamily(sourceInfo?.info);
		if (sourceFamily && player.activeAccessories.some((accessory) => accessory.info.family === sourceFamily)) {
			continue;
		}

		if (source.exists && !source.exists(player)) continue;

		effects.push(...effectsFromSourceStats(source, player));
	}

	return effects;
}

export function collectCropFortuneSourceEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[] {
	if (!env.crop) return [];

	const effects: Effect[] = [];
	const ctx = { player, crop: env.crop };

	for (const source of CROP_FORTUNE_SOURCES) {
		if (source.name === 'Farming Tool') continue;
		if (source.name === 'Helianthus Relic Family') continue;
		if (source.exists && !source.exists(ctx)) continue;

		effects.push(...effectsFromSourceStats(source, ctx));
	}

	return effects;
}
