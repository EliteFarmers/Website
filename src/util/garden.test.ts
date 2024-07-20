import { expect, test } from 'vitest';
import { getCropMilestoneLevels } from './garden';
import { Crop } from '../constants/crops';

test('Crop Milestones', () => {
	const fromElite = {
		cactus: '1280825',
		carrot: '14025750',
		potato: '45419253',
		wheat: '25864279',
		melon: '2867176',
		pumpkin: '1225508',
		mushroom: '6162515',
		cocoaBeans: '674766',
		sugarCane: '2799230',
		netherWart: '88800054',
	};

	expect(getCropMilestoneLevels(fromElite)).toEqual({
		[Crop.Cactus]: 19,
		[Crop.Carrot]: 25,
		[Crop.Potato]: 29,
		[Crop.Wheat]: 33,
		[Crop.Melon]: 19,
		[Crop.Pumpkin]: 21,
		[Crop.Mushroom]: 25,
		[Crop.CocoaBeans]: 17,
		[Crop.SugarCane]: 21,
		[Crop.NetherWart]: 34
	});
});
