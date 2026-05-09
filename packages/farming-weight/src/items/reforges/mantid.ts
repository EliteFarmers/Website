import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class MantidReforge extends BaseReforge {
	constructor() {
		super('mantid', {
			name: 'Mantid',
			wiki: 'https://w.elitesb.gg/Mantid_Claw',
			appliesTo: [ReforgeTarget.Armor],
			stone: {
				name: 'Mantid Claw',
				id: 'MANTID_CLAW',
			},
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.FarmingFortune]: 2, [Stat.BonusPestChance]: 0.5 },
					cost: 7_500,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.FarmingFortune]: 4, [Stat.BonusPestChance]: 0.5 },
					cost: 15_000,
				},
				[Rarity.Rare]: {
					stats: { [Stat.FarmingFortune]: 6, [Stat.BonusPestChance]: 1 },
					cost: 30_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.FarmingFortune]: 8, [Stat.BonusPestChance]: 1.5 },
					cost: 75_000,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.FarmingFortune]: 10, [Stat.BonusPestChance]: 2 },
					cost: 150_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.FarmingFortune]: 12, [Stat.BonusPestChance]: 2.5 },
					cost: 150_000,
				},
			},
		});
	}
}
