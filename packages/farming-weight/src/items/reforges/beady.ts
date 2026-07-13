import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import { BaseReforge } from './base.js';

export class BeadyReforge extends BaseReforge {
	constructor() {
		super('beady', {
			name: 'Beady',
			wiki: 'https://w.elitesb.gg/Beady_Eyes',
			appliesTo: [ReforgeTarget.Vacuum],
			stone: {
				name: 'Beady Eyes',
				id: 'BEADY_EYES',
			},
			tiers: {
				[Rarity.Common]: {
					stats: { [Stat.Damage]: 5, [Stat.Intelligence]: 10, [Stat.PestKillFortune]: 100 },
					cost: 10_000,
				},
				[Rarity.Uncommon]: {
					stats: { [Stat.Damage]: 10, [Stat.Intelligence]: 20, [Stat.PestKillFortune]: 100 },
					cost: 20_000,
				},
				[Rarity.Rare]: {
					stats: { [Stat.Damage]: 15, [Stat.Intelligence]: 30, [Stat.PestKillFortune]: 100 },
					cost: 50_000,
				},
				[Rarity.Epic]: {
					stats: { [Stat.Damage]: 20, [Stat.Intelligence]: 40, [Stat.PestKillFortune]: 100 },
					cost: 75_000,
				},
				[Rarity.Legendary]: {
					stats: { [Stat.Damage]: 25, [Stat.Intelligence]: 50, [Stat.PestKillFortune]: 100 },
					cost: 100_000,
				},
				[Rarity.Mythic]: {
					stats: { [Stat.Damage]: 30, [Stat.Intelligence]: 60, [Stat.PestKillFortune]: 100 },
					cost: 150_000,
				},
			},
		});
	}
}
