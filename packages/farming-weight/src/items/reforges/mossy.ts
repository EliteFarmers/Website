import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class MossyReforge extends BaseReforge {
	constructor() {
		super('mossy', {
			name: 'Mossy',
			wiki: 'https://w.elitesb.gg/Overgrown_Grass',
			appliesTo: [ReforgeTarget.Armor],
			stone: {
				name: 'Overgrown Grass',
				id: 'OVERGROWN_GRASS',
				copper: 150,
			},
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.FarmingFortune]: 5, [Stat.Speed]: 3 },
					cost: 20_000,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.FarmingFortune]: 10, [Stat.Speed]: 3 },
					cost: 40_000,
				},
				[Rarity.Rare]: {
					stats: { [Stat.FarmingFortune]: 15, [Stat.Speed]: 5 },
					cost: 80_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.FarmingFortune]: 20, [Stat.Speed]: 5 },
					cost: 150_000,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.FarmingFortune]: 25, [Stat.Speed]: 7 },
					cost: 300_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.FarmingFortune]: 30, [Stat.Speed]: 7 },
					cost: 600_000,
				},
			},
		});
	}
}
