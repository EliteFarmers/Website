import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class BuzzingReforge extends BaseReforge {
	constructor() {
		super('buzzing', {
			name: 'Buzzing',
			wiki: 'https://w.elitesb.gg/Clipped_Wings',
			appliesTo: [ReforgeTarget.Vacuum],
			stone: {
				name: 'Clipped Wings',
				id: 'CLIPPED_WINGS',
			},
			tiers: {
				[Rarity.Common]: { stats: { [Stat.FarmingFortune]: 2 }, cost: 10_000 },
				[Rarity.Uncommon]: { stats: { [Stat.FarmingFortune]: 3 }, cost: 20_000 },
				[Rarity.Rare]: { stats: { [Stat.FarmingFortune]: 5 }, cost: 50_000 },
				[Rarity.Epic]: { stats: { [Stat.FarmingFortune]: 7 }, cost: 75_000 },
				[Rarity.Legendary]: { stats: { [Stat.FarmingFortune]: 9 }, cost: 100_000 },
				[Rarity.Mythic]: { stats: { [Stat.FarmingFortune]: 11 }, cost: 150_000 },
				[Rarity.Divine]: { stats: { [Stat.FarmingFortune]: 11 }, cost: 250_000 },
			},
		});
	}
}
