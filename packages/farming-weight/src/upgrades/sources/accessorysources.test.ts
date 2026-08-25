import { expect, test } from 'vitest';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingAccessory } from '../../fortune/farmingaccessory.js';

test('Relic of Power gemstone progress uses its configured Mythic cap', () => {
	const relic = new FarmingAccessory({
		name: 'Relic of Power',
		skyblockId: 'POWER_RELIC',
		uuid: 'power-relic',
		lore: [],
		attributes: { rarity: Rarity.Mythic },
		enchantments: {},
		gems: { PERIDOT_0: 'FLAWLESS' },
	});
	const gemstones = relic.getProgress([Stat.FarmingFortune]).find((progress) => progress.name === 'Gemstone Slots');

	expect(gemstones?.stats?.[Stat.FarmingFortune]).toEqual({ current: 4, max: 5, ratio: 0.8 });
});
