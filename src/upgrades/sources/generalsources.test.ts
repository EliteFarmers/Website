import { expect, test } from 'vitest';
import { FarmingPlayer } from '../../player/player.js';

test('General fortune sources', () => {
	const player = new FarmingPlayer({
		farmingLevel: 10,
		bestiaryKills: {
			pest_fly_1: 10,
		},
		anitaBonus: 10,
		plotsUnlocked: 10,
		communityCenter: 10,
	});

	const progress = player.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.maxInfo;
		delete piece.upgrades;
		delete piece.progress;
		delete piece.active;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Farming Level',
			current: 40,
			max: 240,
			ratio: 4 / 24,
		},
		{
			name: 'Attribute Shards',
			current: 0,
			max: 90,
			ratio: 0,
			api: false,
		},
		{
			name: 'Garden Chips',
			current: 0,
			max: 100,
			ratio: 0,
			api: false,
			alwaysInclude: true,
		},
		{
			name: 'Pest Bestiary',
			current: 6 * 0.4,
			max: 84,
			ratio: (6 * 0.4) / 84,
		},
		{
			name: 'Anita Bonus Fortune',
			current: 40,
			max: 60,
			ratio: 4 / 6,
		},
		{
			name: 'Unlocked Plots',
			current: 30,
			max: 72,
			ratio: 30 / 72,
		},
		{
			name: 'Garden Farming Fortune',
			current: 40,
			max: 40,
			ratio: 1,
			api: false,
		},
		{
			name: 'Fermento Artifact',
			current: 0,
			max: 30,
			ratio: 0,
		},
		{
			name: 'Refined Dark Cacao Truffle',
			current: 0,
			max: 5,
			ratio: 0,
		},
		{
			name: 'Relic of Power',
			current: 0,
			max: 5,
			ratio: 0,
		},
		{
			name: 'Magic 8 Ball',
			current: 0,
			max: 25,
			ratio: 0,
		},
	]);
});
