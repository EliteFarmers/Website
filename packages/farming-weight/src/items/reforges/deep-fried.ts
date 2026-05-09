import type { Rarity } from '../../constants/reforge-types.js';
import { ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import type { Effect } from '../../effects/types.js';
import { BaseReforge } from './base.js';

export class DeepFriedReforge extends BaseReforge {
	constructor() {
		super('deep_fried', {
			name: 'Deep Fried',
			wiki: 'https://w.elitesb.gg/Hashbrown',
			appliesTo: [ReforgeTarget.FarmingTool],
			stone: {
				name: 'Hashbrown',
				id: 'HASHBROWN',
			},
			tiers: {
				Common: { stats: { [Stat.FarmingFortune]: 5 }, cost: 20_000 },
				Uncommon: { stats: { [Stat.FarmingFortune]: 9 }, cost: 40_000 },
				Rare: { stats: { [Stat.FarmingFortune]: 13 }, cost: 80_000 },
				Epic: { stats: { [Stat.FarmingFortune]: 18 }, cost: 150_000 },
				Legendary: { stats: { [Stat.FarmingFortune]: 23 }, cost: 300_000 },
				Mythic: { stats: { [Stat.FarmingFortune]: 28 }, cost: 600_000 },
			},
		});
	}

	override getEffects(rarity: Rarity, sourceName?: string): Effect[] {
		const source = sourceName ?? `Reforge: ${this.name}`;
		return [
			...super.getEffects(rarity, source),
			{
				source,
				op: 'mul-drop',
				value: 1.25,
				scope: { tags: ['seasoning'], requiresHarvestFeast: true },
				meta: { description: '+25% Seasoning during Harvest Feast', valueDisplay: 'factor' },
			},
		];
	}
}
