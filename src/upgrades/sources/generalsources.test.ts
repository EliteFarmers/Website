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
	});

	expect(progress).toStrictEqual([
		{
			name: 'Farming Level',
			fortune: 40,
			maxFortune: 240,
			ratio: 4 / 24,
		},
		{
			name: 'Attribute Shards',
			fortune: 0,
			maxFortune: 90,
			ratio: 0,
			api: false,
		},
		{
			name: 'Pest Bestiary',
			fortune: 6 * 0.4,
			maxFortune: 66,
			ratio: (6 * 0.4) / 66,
		},
		{
			name: 'Anita Bonus Fortune',
			fortune: 40,
			maxFortune: 60,
			ratio: 4 / 6,
		},
		{
			name: 'Unlocked Plots',
			fortune: 30,
			maxFortune: 72,
			ratio: 30 / 72,
		},
		{
			name: 'Garden Farming Fortune',
			fortune: 40,
			maxFortune: 40,
			ratio: 1,
			api: false,
		},
		{
			name: 'Fermento Artifact',
			fortune: 0,
			maxFortune: 30,
			ratio: 0,
		},
		{
			name: 'Refined Dark Cacao Truffle',
			fortune: 0,
			maxFortune: 5,
			ratio: 0,
		},
		{
			name: 'Relic of Power',
			fortune: 0,
			maxFortune: 5,
			ratio: 0,
		},
	]);
});
