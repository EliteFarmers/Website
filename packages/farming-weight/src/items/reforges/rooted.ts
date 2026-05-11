import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class RootedReforge extends BaseReforge {
	constructor() {
		super('rooted', {
			name: 'Rooted',
			wiki: 'https://w.elitesb.gg/Burrowing_Spores',
			appliesTo: [ReforgeTarget.Equipment],
			stone: {
				name: 'Burrowing Spores',
				id: 'BURROWING_SPORES',
			},
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.FarmingFortune]: 6, [Stat.Health]: 2 },
					cost: 20_000,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.FarmingFortune]: 9, [Stat.Health]: 5 },
					cost: 40_000,
				},
				[Rarity.Rare]: {
					stats: { [Stat.FarmingFortune]: 12, [Stat.Health]: 8 },
					cost: 80_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.FarmingFortune]: 15, [Stat.Health]: 11 },
					cost: 150_000,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.FarmingFortune]: 18, [Stat.Health]: 14 },
					cost: 300_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.FarmingFortune]: 21, [Stat.Health]: 17 },
					cost: 600_000,
				},
			},
		});
	}
}
