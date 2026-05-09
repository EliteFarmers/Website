import { expect, test } from 'vitest';
import { createFarmingPlayer } from '../player/player';
import { getShardLevel, getShardsForLevel, getShardsForNextLevel } from './attributes';
import { Crop } from './crops';
import { Rarity } from './reforges';

test('Attribute shards leveling test', () => {
	const amount = 19;
	expect(getShardLevel(Rarity.Legendary, amount)).toBe(9);
	expect(getShardsForNextLevel(Rarity.Legendary, amount)).toBe(5);
	expect(getShardsForLevel(Rarity.Legendary, 9)).toBe(19);
});

test('Attribute shards 0 test', () => {
	const amount = 0;
	expect(getShardLevel(Rarity.Legendary, amount)).toBe(0);
	expect(getShardsForNextLevel(Rarity.Legendary, amount)).toBe(1);
});

test('Wartybug shard adds Warty to rate calc results', () => {
	const player = createFarmingPlayer({
		farmingLevel: 60,
		attributes: {
			wart_eater: 72,
		},
	});

	const rngItems = player.getRates(Crop.NetherWart, 72000).rngItems;

	expect(rngItems).toHaveProperty('WARTY');
});
