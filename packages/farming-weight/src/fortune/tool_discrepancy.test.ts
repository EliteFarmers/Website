
import { describe, expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import { FARMING_TOOLS } from '../items/tools.js';
import { FarmingPlayer } from '../player/player.js';
import { TOOL_FORTUNE_SOURCES } from '../upgrades/sources/toolsources.js';
import { FarmingTool } from './farmingtool.js';

describe('Dedication Display Discrepancy', () => {
	const netherwartHoe = FARMING_TOOLS.THEORETICAL_HOE_WARTS_3;
	const player = new FarmingPlayer({
		milestones: {
			[Crop.NetherWart]: 46, // Dedication 4 multiplier 2 = 92
		},
	});

	const tool = new FarmingTool(
		{
			...netherwartHoe,
			enchantments: {
				dedication: 4,
                turbo_warts: 5,
			},
            attributes: {
                farming_for_dummies_count: '0',
            }
		},
		player.options
	);

	test('Dedication should have correct max and current for Nether Wart Fortune', () => {
		// Find Dedication source
		const dedicationSource = TOOL_FORTUNE_SOURCES.find((s) => s.name === 'Dedication');
		expect(dedicationSource).toBeDefined();

		if (!dedicationSource) return;

		// Calculate values for NetherWartFortune
		const current = dedicationSource.currentStat(tool, Stat.NetherWartFortune);
		const max = dedicationSource.maxStat(tool, Stat.NetherWartFortune);

		// Current should be 92 (46 * 2)
		expect(current).toBe(92);
		// Max should represent the potential (which with current milestones is also 92)
        // Previously it was 0 because of the maxStats bug.
		expect(max).toBe(92);
	});

    test('Dedication should NOT appear for Farming Fortune', () => {
        const dedicationSource = TOOL_FORTUNE_SOURCES.find((s) => s.name === 'Dedication');
        expect(dedicationSource).toBeDefined();
        if (!dedicationSource) return;

        // Dedication only provides crop fortune now.
        // So for FarmingFortune it should be 0.
        const current = dedicationSource.currentStat(tool, Stat.FarmingFortune);
        const max = dedicationSource.maxStat(tool, Stat.FarmingFortune);

        expect(current).toBe(0);
        expect(max).toBe(0); // If max is 0, it won't show in the UI list for FarmingFortune
    });

    test('Tool Header (Sum of Maxes) should be consistent', () => {
        // Imitate how UI sums up maxes for a category
        // Category: Farming Tool
        // Stat: NetherWartFortune
        let totalCurrent = 0;
        let totalMax = 0;

        for (const source of TOOL_FORTUNE_SOURCES) {
            if (source.exists(tool)) {
                totalCurrent += source.currentStat(tool, Stat.NetherWartFortune);
                totalMax += source.maxStat(tool, Stat.NetherWartFortune);
            }
        }

        // Contributors:
        // Dedication: 92 / 92
        // Turbo-Warts: 25 / 25
        // Tool Level: 0 / 0 (provides FF)
        // Reforge: 0 / 0 (provides FF)
        
        // Total should be 117 / 117
        expect(totalCurrent).toBe(117);
        expect(totalMax).toBe(117);
    });
});
