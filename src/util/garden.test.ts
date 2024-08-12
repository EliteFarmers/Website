import { expect, test } from 'vitest';
import { getCropMilestoneLevels, getCropMilestones } from './garden';
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

	const expected = {
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
	};

	expect(getCropMilestoneLevels(fromElite)).toEqual(expected);
	expect(getCropMilestoneLevels(fromElite, true)).toEqual(expected);
});

test('Overflow Crop Milestones', () => {
	const fromElite = {
		cactus: '1280825',
		carrot: '14025750',
		potato: '45419253',
		wheat: '257018164',
		melon: '18008047454',
		pumpkin: '1225508',
		mushroom: '233085546',
		cocoaBeans: '674766',
		sugarCane: '2799230',
		netherWart: '88800054',
	};

	expect(getCropMilestoneLevels(fromElite, true)).toEqual({
		[Crop.Cactus]: 19,
		[Crop.Carrot]: 25,
		[Crop.Potato]: 29,
		[Crop.Wheat]: 110,
		[Crop.Melon]: 1225,
		[Crop.Pumpkin]: 21,
		[Crop.Mushroom]: 102,
		[Crop.CocoaBeans]: 17,
		[Crop.SugarCane]: 21,
		[Crop.NetherWart]: 34
	});

	const milestones = getCropMilestones(fromElite, true);
	expect(milestones[Crop.Wheat].maxed).toBe(true);
	expect(milestones[Crop.Wheat].next).toBe(111);

	expect(milestones[Crop.Melon].maxed).toBe(true);
	expect(milestones[Crop.Melon].next).toBe(1226);
	expect(milestones[Crop.Melon].goal).toBe(15_000_000);
	expect(milestones[Crop.Melon].ratio).toBeCloseTo(0.155);
	expect(milestones[Crop.Melon].progress).toBe(2331654);

	expect(milestones[Crop.Mushroom].maxed).toBe(true);

	expect(milestones[Crop.Pumpkin].maxed).toBe(false);
	expect(milestones[Crop.Pumpkin].next).toBe(22);
});