import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class BountifulReforge extends BaseReforge {
	constructor() {
		super('bountiful', {
			name: 'Bountiful',
			wiki: 'https://w.elitesb.gg/Golden_Ball',
			appliesTo: [ReforgeTarget.FarmingTool],
			priority: true,
			stone: {
				name: 'Golden Ball',
				id: 'GOLDEN_BALL',
				npc: 1_000_000,
			},
			tiers: {
				[Rarity.Common]: {
					stats: {
						[Stat.FarmingFortune]: 1,
						[Stat.Speed]: 1,
					},
					cost: 20_000,
				},
				[Rarity.Uncommon]: {
					stats: {
						[Stat.FarmingFortune]: 2,
						[Stat.Speed]: 2,
					},
					cost: 40_000,
				},
				[Rarity.Rare]: {
					stats: {
						[Stat.FarmingFortune]: 3,
						[Stat.Speed]: 3,
					},
					cost: 80_000,
				},
				[Rarity.Epic]: {
					stats: {
						[Stat.FarmingFortune]: 5,
						[Stat.Speed]: 5,
					},
					cost: 150_000,
				},
				[Rarity.Legendary]: {
					stats: {
						[Stat.FarmingFortune]: 7,
						[Stat.Speed]: 8,
					},
					cost: 300_000,
				},
				[Rarity.Mythic]: {
					stats: {
						[Stat.FarmingFortune]: 10,
						[Stat.Speed]: 13,
					},
					cost: 600_000,
				},
			},
		});
	}
}
