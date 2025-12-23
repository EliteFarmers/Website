import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { getCropMilestoneLevels, getCropMilestones, getNextPlotCost } from './garden.js';

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
		[Crop.Potato]: 37,
		[Crop.Wheat]: 46,
		[Crop.Melon]: 19,
		[Crop.Pumpkin]: 21,
		[Crop.Mushroom]: 28,
		[Crop.CocoaBeans]: 17,
		[Crop.SugarCane]: 21,
		[Crop.NetherWart]: 46,
	};

	expect(getCropMilestoneLevels(fromElite)).toEqual(expected);
	expect(getCropMilestoneLevels(fromElite, true)).toEqual({ ...expected, [Crop.Wheat]: 53, [Crop.NetherWart]: 57 });
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
		[Crop.Potato]: 37,
		[Crop.Wheat]: 341,
		[Crop.Melon]: 4522,
		[Crop.Pumpkin]: 21,
		[Crop.Mushroom]: 312,
		[Crop.CocoaBeans]: 17,
		[Crop.SugarCane]: 21,
		[Crop.NetherWart]: 57,
	});

	const milestones = getCropMilestones(fromElite, true);
	expect(milestones[Crop.Wheat].maxed).toBe(true);
	expect(milestones[Crop.Wheat].next).toBe(342);

	expect(milestones[Crop.Melon].maxed).toBe(true);
	expect(milestones[Crop.Melon].next).toBe(4523);
	expect(milestones[Crop.Melon].goal).toBe(4000000);
	expect(milestones[Crop.Melon].ratio).toBeCloseTo(0.738851);
	expect(milestones[Crop.Melon].progress).toBe(2955404);

	expect(milestones[Crop.Mushroom].maxed).toBe(true);

	expect(milestones[Crop.Pumpkin].maxed).toBe(false);
	expect(milestones[Crop.Pumpkin].next).toBe(22);
});

test('Plot costs', () => {
	expect(getNextCost([])).toBe(1);
	expect(getNextCost(['beginner_1'])).toBe(2);
	expect(getNextCost(['beginner_1', 'advanced_1'])).toBe(2);
	expect(getNextCost(['beginner_1', 'advanced_1', 'expert_1'])).toBe(2);

	expect(getNextCost(['beginner_1', 'beginner_2'])).toBe(4);
	expect(getNextCost(['beginner_1', 'beginner_2', 'beginner_3'])).toBe(8);
	expect(getNextCost(['beginner_1', 'beginner_3'])).toBe(4);
	expect(getNextCost(['beginner_1', 'beginner_2', 'beginner_3', 'beginner_4'])).toBe(16);

	expect(
		getNextCost([
			'beginner_1',
			'beginner_2',
			'beginner_3',
			'beginner_4',
			'intermediate_1',
			'intermediate_2',
			'intermediate_3',
			'intermediate_4',
			'advanced_1',
			'advanced_2',
			'advanced_3',
			'advanced_4',
			'advanced_5',
			'advanced_6',
			'advanced_7',
			'advanced_8',
			'advanced_9',
			'advanced_10',
			'advanced_11',
			'advanced_12',
			'expert_1',
			'expert_2',
			'expert_3',
			'expert_4',
		])
	).toBe(undefined);

	expect(
		getNextCost([
			'beginner_1',
			'beginner_2',
			'beginner_3',
			'beginner_4',
			'intermediate_1',
			'intermediate_2',
			'intermediate_3',
			'intermediate_4',
			'advanced_1',
			'advanced_2',
			'advanced_3',
			'advanced_4',
			'advanced_5',
			'advanced_6',
			'advanced_7',
			'advanced_8',
			'advanced_9',
			'advanced_10',
			'advanced_11',
			'advanced_12',
			'expert_1',
			'expert_2',
			'expert_3',
		])
	).toBe(2400);

	function getNextCost(plots: string[]): number | undefined {
		return getNextPlotCost(plots)?.cost?.items?.COMPOST;
	}
});
