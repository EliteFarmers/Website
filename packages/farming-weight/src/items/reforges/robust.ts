import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class RobustReforge extends BaseReforge {
	constructor() {
		super('robust', {
			name: 'Robust',
			wiki: 'https://w.elitesb.gg/Reforging#Tool',
			appliesTo: [ReforgeTarget.FarmingTool],
			tiers: {
				[Rarity.Common]: { stats: { [Stat.FarmingFortune]: 2 }, cost: 250 },
				[Rarity.Uncommon]: { stats: { [Stat.FarmingFortune]: 3 }, cost: 500 },
				[Rarity.Rare]: { stats: { [Stat.FarmingFortune]: 4 }, cost: 1_000 },
				[Rarity.Epic]: { stats: { [Stat.FarmingFortune]: 6 }, cost: 2_500 },
				[Rarity.Legendary]: { stats: { [Stat.FarmingFortune]: 8 }, cost: 5_000 },
				[Rarity.Mythic]: { stats: { [Stat.FarmingFortune]: 10 }, cost: 10_000 },
				[Rarity.Divine]: { stats: { [Stat.FarmingFortune]: 10 }, cost: 10_000 },
			},
		});
	}
}
