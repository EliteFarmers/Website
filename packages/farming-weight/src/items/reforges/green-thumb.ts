import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class GreenThumbReforge extends BaseReforge {
	constructor() {
		super('green_thumb', {
			name: 'Green Thumb',
			wiki: 'https://w.elitesb.gg/Reforging#Tool',
			appliesTo: [ReforgeTarget.FarmingTool],
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.FarmingFortune]: 1, [Stat.Speed]: 1 },
					cost: 250,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.FarmingFortune]: 2, [Stat.Speed]: 2 },
					cost: 500,
				},
				[Rarity.Rare]: {
					stats: { [Stat.FarmingFortune]: 3, [Stat.Speed]: 3 },
					cost: 1_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.FarmingFortune]: 4, [Stat.Speed]: 5 },
					cost: 2_500,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.FarmingFortune]: 5, [Stat.Speed]: 7 },
					cost: 5_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.FarmingFortune]: 6, [Stat.Speed]: 9 },
					cost: 10_000,
				},
				[Rarity.Divine]: {
					stats: { [Stat.FarmingFortune]: 6, [Stat.Speed]: 9 },
					cost: 10_000,
				},
			},
		});
	}
}
