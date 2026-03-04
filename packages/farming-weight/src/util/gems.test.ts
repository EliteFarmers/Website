import { expect, test } from 'vitest';
import { FarmingArmor } from '../fortune/farmingarmor';
import { getPeridotFortune } from './gems';

const almostMaxHelmet = {
	id: 397,
	count: 1,
	skyblockId: 'FERMENTO_HELMET',
	uuid: '9a6966f0-dd42-4797-af83-e0461f00bd02',
	name: '§dMossy Fermento Helmet §4✦',
	lore: ['§d§l§ka§r §d§l§d§lLEGENDARY HELMET §d§l§ka'],
	enchantments: { rejuvenate: 5, respiration: 3, aqua_affinity: 1, pesterminator: 3 },
	attributes: {
		skin: 'FERMENTO_ULTIMATE',
		modifier: 'mossy',
		timestamp: '1676403240000',
		favorite_crop: '89',
	},
	gems: { PERIDOT_0: 'FLAWLESS', PERIDOT_1: null },
};

test('Get Peridot Fortune', () => {
	const armor = new FarmingArmor(almostMaxHelmet);
	const peridotFortune = getPeridotFortune(armor.rarity, armor.item);
	expect(peridotFortune).toBe(6);
});
