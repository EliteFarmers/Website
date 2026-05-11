import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class BloomingReforge extends BaseReforge {
	constructor() {
		super('blooming', {
			name: 'Blooming',
			wiki: 'https://w.elitesb.gg/Flowering_Bouquet',
			appliesTo: [ReforgeTarget.Equipment],
			stone: {
				name: 'Flowering Bouquet',
				id: 'FLOWERING_BOUQUET',
			},
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.FarmingFortune]: 1, [Stat.Speed]: 4 },
					cost: 5_000,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.FarmingFortune]: 2, [Stat.Speed]: 4 },
					cost: 10_000,
				},
				[Rarity.Rare]: {
					stats: { [Stat.FarmingFortune]: 3, [Stat.Speed]: 5 },
					cost: 20_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.FarmingFortune]: 4, [Stat.Speed]: 5 },
					cost: 50_000,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.FarmingFortune]: 5, [Stat.Speed]: 6 },
					cost: 100_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.FarmingFortune]: 6, [Stat.Speed]: 6 },
					cost: 200_000,
				},
			},
		});
	}
}
