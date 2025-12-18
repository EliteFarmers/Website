import { expect, test } from 'vitest';
import { Crop } from '../../constants/crops.js';
import { FarmingTool } from '../../fortune/farmingtool.js';
import type { EliteItemDto } from '../../fortune/item.js';
import { FARMING_TOOLS, type FarmingToolInfo } from '../../items/tools.js';
import { FarmingPlayer } from '../../player/player.js';

const fermentoArtifact: EliteItemDto = {
	id: 397,
	count: 1,
	skyblockId: 'FERMENTO_ARTIFACT',
	uuid: '1eb48c41-c8db-48d7-aec6-bf4221244bcf',
	name: '§5Fermento Artifact',
	lore: ['§7Farming Fortune: §a+30', '', '§5§l§ka§r §5§lEPIC ACCESSORY §5§l§ka'],
	enchantments: null,
	attributes: { timestamp: '1680031500000', rarity_upgrades: '1' },
};

const squashRing: EliteItemDto = {
	id: 397,
	count: 1,
	skyblockId: 'SQUASH_RING',
	uuid: '1eb48c41-c8db-48d7-aec6-bf4221244bcf',
	name: '§5Squash Ring',
	lore: ['§7Farming Fortune: §a+20', '', '§5§l§ka§r §5§lRARE ACCESSORY §5§l§ka'],
	enchantments: null,
	attributes: { timestamp: '1680031500000', rarity_upgrades: '1' },
};

const cropieTalisman: EliteItemDto = {
	id: 397,
	count: 1,
	skyblockId: 'CROPIE_TALISMAN',
	uuid: '1eb48c41-c8db-48d7-aec6-bf4221244bcf',
	name: '§5Cropie Talisman',
	lore: ['§7Farming Fortune: §a+10', '', '§5§l§ka§r §5§lUNCOMMON ACCESSORY §5§l§ka'],
	enchantments: null,
	attributes: { timestamp: '1680031500000', rarity_upgrades: '1' },
};

test('Wheat fortune test', () => {
	const player = new FarmingPlayer({
		exportableCrops: {
			[Crop.Wheat]: true,
		},
		cropUpgrades: {
			[Crop.Wheat]: 1,
		},
		personalBestsUnlocked: true,
		personalBests: {
			[Crop.Wheat]: 10000,
		},
		accessories: [fermentoArtifact, squashRing, cropieTalisman],
	});

	const progress = player.getCropProgress(Crop.Wheat);

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
		delete piece.progress;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Farming Tool',
			current: 0,
			max: 465,
			ratio: 0,
		},
		{
			name: 'Exportable Crop',
			current: 12,
			max: 12,
			ratio: 1,
		},
		{
			name: 'Garden Crop Upgrade',
			current: 5,
			max: 45,
			ratio: 5 / 45,
		},
		{
			name: 'Fermento Artifact Family',
			current: 30,
			max: 30,
			ratio: 1,
		},
		{
			name: 'Personal Best',
			current: 1,
			max: 100,
			ratio: 1 / 100,
		},
	]);

	const generalSources = player.getProgress();
	const fermento = generalSources.find((source) => source.name === 'Fermento Artifact');
	expect(fermento).toBeDefined();
	expect(fermento?.current).toBe(0);

	const cropFortune = player.getCropFortune(Crop.Wheat);
	expect(cropFortune.fortune).toBe(progress.reduce((acc, piece) => acc + piece.current, 0));
});

test('Potato fortune test', () => {
	const player = new FarmingPlayer({
		exportableCrops: {
			[Crop.Potato]: true,
		},
		cropUpgrades: {
			[Crop.Potato]: 9,
		},
		accessories: [squashRing, cropieTalisman],
	});

	const progress = player.getCropProgress(Crop.Potato);

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
		delete piece.progress;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Farming Tool',
			current: 0,
			max: 465,
			ratio: 0,
		},
		{
			name: 'Garden Crop Upgrade',
			current: 45,
			max: 45,
			ratio: 1,
		},
		{
			name: 'Fermento Artifact Family',
			current: 20,
			max: 30,
			ratio: 20 / 30,
		},
		{
			name: 'Personal Best',
			current: 0,
			max: 100,
			ratio: 0,
		},
	]);
});

test('Nether Wart fortune test', () => {
	const player = new FarmingPlayer({
		accessories: [squashRing, cropieTalisman],
		personalBestsUnlocked: true,
		personalBests: {
			[Crop.NetherWart]: 30000,
		},
	});

	const progress = player.getCropProgress(Crop.NetherWart);

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
		delete piece.progress;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Farming Tool',
			current: 0,
			max: 465,
			ratio: 0,
		},
		{
			name: 'Exportable Crop',
			current: 0,
			max: 12,
			ratio: 0,
		},
		{
			name: 'Garden Crop Upgrade',
			current: 0,
			max: 45,
			ratio: 0,
		},
		{
			name: 'Personal Best',
			current: 1,
			max: 100,
			ratio: 1 / 100,
		},
	]);
});

test('Carrot fortune test', () => {
	const player = new FarmingPlayer({
		exportableCrops: {
			[Crop.Carrot]: true,
		},
		accessories: [cropieTalisman],
		tools: [
			FarmingTool.fakeItem(FARMING_TOOLS['THEORETICAL_HOE_CARROT_2'] as FarmingToolInfo) ??
				new FarmingTool({} as EliteItemDto),
		],
	});

	const progress = player.getCropProgress(Crop.Carrot);

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
		delete piece.progress;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Farming Tool',
			current: 4,
			max: 465,
			ratio: 4 / 465,
		},
		{
			name: 'Exportable Crop',
			current: 12,
			max: 12,
			ratio: 1,
		},
		{
			name: 'Garden Crop Upgrade',
			current: 0,
			max: 45,
			ratio: 0,
		},
		{
			name: 'Fermento Artifact Family',
			current: 10,
			max: 30,
			ratio: 10 / 30,
		},
		{
			name: 'Personal Best',
			current: 0,
			max: 100,
			ratio: 0,
		},
	]);
});

test('Melon fortune test', () => {
	const player = new FarmingPlayer({
		cropUpgrades: {
			[Crop.Melon]: 3,
		},
		accessories: [cropieTalisman],
	});

	const progress = player.getCropProgress(Crop.Melon);

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
		delete piece.progress;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Farming Tool',
			current: 0,
			max: 474.3,
			ratio: 0,
		},
		{
			name: 'Garden Crop Upgrade',
			current: 15,
			max: 45,
			ratio: 15 / 45,
		},
		{
			name: 'Personal Best',
			current: 0,
			max: 100,
			ratio: 0,
		},
	]);
});

test('Cropie talisman test', () => {
	const player = new FarmingPlayer({
		cropUpgrades: {
			[Crop.Wheat]: 3,
		},
		accessories: [cropieTalisman],
	});

	const progress = player.getCropProgress(Crop.Wheat);

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	const cropie = progress.find((p) => p.name === 'Fermento Artifact Family');
	expect(cropie).toBeDefined();

	expect(cropie).toStrictEqual({
		name: 'Fermento Artifact Family',
		current: 10,
		max: 30,
		ratio: 10 / 30,
	});
});

test('Squash ring test', () => {
	const player = new FarmingPlayer({
		cropUpgrades: {
			[Crop.Wheat]: 3,
		},
		accessories: [squashRing],
	});

	const progress = player.getCropProgress(Crop.Wheat);

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	const squash = progress.find((p) => p.name === 'Fermento Artifact Family');
	expect(squash).toBeDefined();

	expect(squash).toStrictEqual({
		name: 'Fermento Artifact Family',
		current: 20,
		max: 30,
		ratio: 20 / 30,
	});

	const generalSources = player.getProgress();
	const fermento = generalSources.find((source) => source.name === 'Fermento Artifact');
	expect(fermento).toBeDefined();
	expect(fermento?.current).toBe(0);

	expect(player.breakdown['Fermento Artifact']).toBeUndefined();
});
