import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export const THORNY_OVERBLOOM_PER_THORNS_LEVEL = 0.1;

export class ThornyReforge extends BaseReforge {
	constructor() {
		super('thorny', {
			name: 'Thorny',
			wiki: 'https://w.elitesb.gg/Blooming_Thorns',
			appliesTo: [ReforgeTarget.Equipment],
			stone: {
				name: 'Blooming Thorns',
				id: 'BLOOMING_THORNS',
			},
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.FarmingFortune]: 2, [Stat.Overbloom]: 0.25 },
					cost: 20_000,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.FarmingFortune]: 4, [Stat.Overbloom]: 0.5 },
					cost: 40_000,
				},
				[Rarity.Rare]: {
					stats: { [Stat.FarmingFortune]: 6, [Stat.Overbloom]: 0.75 },
					cost: 80_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.FarmingFortune]: 8, [Stat.Overbloom]: 1 },
					cost: 150_000,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.FarmingFortune]: 10, [Stat.Overbloom]: 1.25 },
					cost: 300_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.FarmingFortune]: 12, [Stat.Overbloom]: 1.5 },
					cost: 600_000,
				},
			},
		});
	}
}
