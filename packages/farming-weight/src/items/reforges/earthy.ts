import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class EarthyReforge extends BaseReforge {
	constructor() {
		super('earthy', {
			name: 'Earthy',
			wiki: 'https://w.elitesb.gg/Large_Walnut',
			appliesTo: [ReforgeTarget.FarmingTool],
			stone: {
				name: 'Large Walnut',
				id: 'LARGE_WALNUT',
				copper: 150,
			},
			tiers: {
				[Rarity.Common]: { stats: { [Stat.FarmingFortune]: 2 }, cost: 5_000 },
				[Rarity.Uncommon]: { stats: { [Stat.FarmingFortune]: 4 }, cost: 10_000 },
				[Rarity.Rare]: { stats: { [Stat.FarmingFortune]: 6 }, cost: 20_000 },
				[Rarity.Epic]: { stats: { [Stat.FarmingFortune]: 8 }, cost: 50_000 },
				[Rarity.Legendary]: { stats: { [Stat.FarmingFortune]: 10 }, cost: 100_000 },
				[Rarity.Mythic]: { stats: { [Stat.FarmingFortune]: 12 }, cost: 200_000 },
			},
		});
	}
}
