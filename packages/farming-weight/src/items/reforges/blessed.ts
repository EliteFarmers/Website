import { LIST_OF_CROPS } from '../../constants/crops.js';
import { Rarity, ReforgeTarget } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import type { Effect } from '../../effects/types.js';
import { BaseReforge } from './base.js';

const BLESSED_DROP_CHANCE = 0.0022;
const BLESSED_DROP_AMOUNT = 160;

export class BlessedReforge extends BaseReforge {
	constructor() {
		super('blessed', {
			name: 'Blessed',
			wiki: 'https://w.elitesb.gg/Blessed_Fruit',
			appliesTo: [ReforgeTarget.FarmingTool],
			stone: {
				name: 'Blessed Fruit',
				id: 'BLESSED_FRUIT',
				npc: 1_000_000,
			},
			tiers: {
				[Rarity.Common]: {
					stats: {
						[Stat.FarmingFortune]: 5,
						[Stat.FarmingWisdom]: 1,
						[Stat.Speed]: 5,
					},
					cost: 10_000,
				},
				[Rarity.Uncommon]: {
					stats: {
						[Stat.FarmingFortune]: 7,
						[Stat.FarmingWisdom]: 2,
						[Stat.Speed]: 7,
					},
					cost: 10_000,
				},
				[Rarity.Rare]: {
					stats: {
						[Stat.FarmingFortune]: 10,
						[Stat.FarmingWisdom]: 3,
						[Stat.Speed]: 9,
					},
					cost: 10_000,
				},
				[Rarity.Epic]: {
					stats: {
						[Stat.FarmingFortune]: 13,
						[Stat.FarmingWisdom]: 4,
						[Stat.Speed]: 13,
					},
					cost: 10_000,
				},
				[Rarity.Legendary]: {
					stats: {
						[Stat.FarmingFortune]: 16,
						[Stat.FarmingWisdom]: 5,
						[Stat.Speed]: 16,
					},
					cost: 10_000,
				},
				[Rarity.Mythic]: {
					stats: {
						[Stat.FarmingFortune]: 20,
						[Stat.FarmingWisdom]: 6,
						[Stat.Speed]: 20,
					},
					cost: 10_000,
				},
			},
		});
	}

	override getEffects(rarity: Rarity, sourceName?: string): Effect[] {
		const source = sourceName ?? `Reforge: ${this.name}`;
		return [
			...super.getEffects(rarity, source),
			...LIST_OF_CROPS.map(
				(crop): Effect => ({
					source: 'Blessed Reforge',
					op: 'add-drop',
					scope: { crops: [crop] },
					drop: {
						itemId: crop,
						output: 'collection',
						baseAmount: BLESSED_DROP_CHANCE * BLESSED_DROP_AMOUNT,
						dropKind: 'crop',
						tags: ['crop-drop'],
					},
					meta: { description: '0.22% chance per block to drop 160 of the crop being farmed' },
				})
			),
		];
	}
}
