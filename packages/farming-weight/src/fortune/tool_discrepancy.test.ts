import { describe, expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import { FarmingPlayer } from '../player/player.js';

describe('Tool Fortune Discrepancy', () => {
	test('Tool value in breakdown should match tool stats', () => {
		const rawTool = {
			id: 279,
			count: 1,
			damage: 0,
			skyblockId: 'MELON_DICER_3',
			uuid: 'd1feb274-900e-4809-9721-20079ad54af7',
			name: '§6Bountiful Melon Dicer Mk. III',
			lore: ['§7Farming Fortune: §6+133.62 §2(+5) §9(+7) §d(+24)', '§7Melon Slice Fortune: §6+323.34'],
			enchantments: {
				sunder: 6,
				delicate: 5,
				dedication: 4,
				efficiency: 5,
				cultivating: 10,
				turbo_melon: 5,
				ultimate_crop_fever: 5,
			},
			attributes: {
				modifier: 'bountiful',
				timestamp: '1765393163935',
				levelable_exp: '156051.23374950708',
				levelable_lvl: '50',
				rarity_upgrades: '1',
				farmed_cultivating: '327447047',
				levelable_overclocks: '10',
				farming_for_dummies_count: '5',
			},
			gems: {
				PERIDOT_0: 'FLAWLESS',
				PERIDOT_1: 'FLAWLESS',
				PERIDOT_2: 'FLAWLESS',
				PERIDOT_3: 'FLAWLESS',
			},
			slot: '0',
		};

		// Mock player options/context if needed for Dedication/Turbo
		const options = {
			farmingLevel: 50,
			uniqueVisitors: 100, // guess
			milestones: { MELON: 46 }, // matches sample
			medals: { gold: 10 }, // ensure turbo works
			tools: [rawTool],
		};

		const player = new FarmingPlayer(options);
		const tool = player.tools[0];

		// Direct Tool Stats
		const farmFortune = tool.getStat(Stat.FarmingFortune);
		const melonFortune = tool.getStat(Stat.MelonFortune);
		console.log('Tool FarmingFortune:', farmFortune);
		console.log('Tool MelonFortune:', melonFortune);
		console.log('Tool Total (Sum):', farmFortune + melonFortune);

		// Player Breakdown
		const breakdown = player.getCropFortune(Crop.Melon).breakdown;
		const toolContribution = breakdown['Farming Tool']?.value;

		expect(toolContribution).toBeCloseTo(farmFortune + melonFortune, 2);
	});
});
