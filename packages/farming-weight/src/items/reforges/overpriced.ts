import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class OverpricedReforge extends BaseReforge {
	constructor() {
		super('overpriced', {
			name: 'Overpriced',
			wiki: 'https://w.elitesb.gg/Overpriced_Drink',
			appliesTo: [ReforgeTarget.FarmingTool],
			stone: {
				name: 'Overpriced Drink',
				id: 'OVERPRICED_DRINK',
			},
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.FarmingFortune]: 5, [Stat.Overbloom]: 7 },
					cost: 20_000,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.FarmingFortune]: 10, [Stat.Overbloom]: 7 },
					cost: 40_000,
				},
				[Rarity.Rare]: {
					stats: { [Stat.FarmingFortune]: 15, [Stat.Overbloom]: 7 },
					cost: 80_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.FarmingFortune]: 20, [Stat.Overbloom]: 7 },
					cost: 150_000,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.FarmingFortune]: 25, [Stat.Overbloom]: 7 },
					cost: 300_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.FarmingFortune]: 30, [Stat.Overbloom]: 7 },
					cost: 600_000,
				},
			},
		});
	}
}
