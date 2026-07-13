import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class BustlingReforge extends BaseReforge {
	constructor() {
		super('bustling', {
			name: 'Bustling',
			wiki: 'https://w.elitesb.gg/SkyMart_Brochure',
			appliesTo: [ReforgeTarget.Armor],
			stone: {
				name: 'SkyMart Brochure',
				id: 'SKYMART_BROCHURE',
				copper: 100,
			},
			tiers: {
				[Rarity.Common]: { stats: { [Stat.FarmingFortune]: 1 }, cost: 1_000 },
				[Rarity.Uncommon]: { stats: { [Stat.FarmingFortune]: 2 }, cost: 2_000 },
				[Rarity.Rare]: { stats: { [Stat.FarmingFortune]: 4 }, cost: 3_000 },
				[Rarity.Epic]: { stats: { [Stat.FarmingFortune]: 6 }, cost: 6_000 },
				[Rarity.Legendary]: { stats: { [Stat.FarmingFortune]: 8 }, cost: 10_000 },
				[Rarity.Mythic]: { stats: { [Stat.FarmingFortune]: 10 }, cost: 15_000 },
			},
		});
	}
}
