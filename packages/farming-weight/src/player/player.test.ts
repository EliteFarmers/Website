import { expect, test } from 'vitest';
import { FARMING_ATTRIBUTE_SHARDS } from '../constants/attributes.js';
import { Crop } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import { FarmingPet } from '../fortune/farmingpet.js';
import { FarmingPlayer } from './player.js';

test('Player construct test', () => {
	const player = new FarmingPlayer({});
	expect(player.breakdown).toStrictEqual({});
	expect(player.fortune).toBe(0);
});

test('Temp fortune test', () => {
	const player = new FarmingPlayer({
		temporaryFortune: {
			centuryCake: true,
			chocolateTruffle: true,
			pestTurnIn: 200,
			harvestPotion: true,
			magic8Ball: true,
			springFilter: true,
		},
	});

	expect(player.tempFortuneBreakdown).toStrictEqual({
		'Century Cake': { value: 5, stat: Stat.FarmingFortune },
		'Refined Dark Cacao Truffle': { value: 30, stat: Stat.FarmingFortune },
		'Pest Turn-In': { value: 200, stat: Stat.FarmingFortune },
		'Harvest Harbinger Potion': { value: 50, stat: Stat.FarmingFortune },
		'Magic 8 Ball': { value: 25, stat: Stat.FarmingFortune },
		'Spring Filter': { value: 25, stat: Stat.FarmingFortune },
	});
});

test('Hypercharge chip temp fortune scaling test', () => {
	const player = new FarmingPlayer({
		chips: {
			hypercharge: 20,
		},
		temporaryFortune: {
			centuryCake: true,
		},
	});

	// Doubled
	expect(player.tempFortuneBreakdown['Century Cake'].value).toBe(10);
});

test('Garden chips stat contribution test', () => {
	const player = new FarmingPlayer({
		chips: {
			cropshot: 10,
			vermin_vaporizer: 7,
			sowledge: 4,
		},
	});

	const ff = player.getStat(Stat.FarmingFortune);
	const bpc = player.getStat(Stat.BonusPestChance);
	const wisdom = player.getStat(Stat.FarmingWisdom);

	expect(ff).toBe(30);
	expect(bpc).toBe(21);
	expect(wisdom).toBe(4);
});

test('Garden chips accept short names', () => {
	const player = new FarmingPlayer({
		chips: {
			cropshot: 10, // Short name
			vermin_vaporizer: 7, // Short name
			sowledge: 4, // Full name still works
		},
	});

	const ff = player.getStat(Stat.FarmingFortune);
	const bpc = player.getStat(Stat.BonusPestChance);
	const wisdom = player.getStat(Stat.FarmingWisdom);

	expect(ff).toBe(30);
	expect(bpc).toBe(21);
	expect(wisdom).toBe(4);

	// Verify internal normalization to full IDs
	expect(player.options.chips?.cropshot).toBe(10);
	expect(player.options.chips?.vermin_vaporizer).toBe(7);
	expect(player.options.chips?.sowledge).toBe(4);
});

test('Overdrive chip contest crop fortune test', () => {
	const player = new FarmingPlayer({
		chips: {
			overdrive: 20,
		},
		jacobContest: {
			enabled: true,
			crop: Crop.Wheat,
		},
	});

	const cropFortune = player.getCropFortune(Crop.Wheat);
	expect(cropFortune.breakdown['Overdrive Chip'].value).toBe(100);

	const other = player.getCropFortune(Crop.Carrot);
	expect(other.breakdown['Overdrive Chip']).toBeUndefined();
});

test('Garden chips appear in progress output', () => {
	const player = new FarmingPlayer({});
	const progress = player.getProgress();

	const chips = progress.find((p) => p.name === 'Garden Chips');
	expect(chips).toBeDefined();
	expect(chips?.progress?.length).toBe(10);
	expect(chips?.name).toBe('Garden Chips');
});

test('Fortune progress test', () => {
	const player = new FarmingPlayer({
		plotsUnlocked: 1,
	});

	const progress = player.getProgress();

	const plots = progress.find((p) => p.name === 'Unlocked Plots');
	expect(plots?.current).toBe(3);
});

test('Max attribute shard fortune test', () => {
	const player = new FarmingPlayer({
		attributes: Object.fromEntries(Object.keys(FARMING_ATTRIBUTE_SHARDS).map((key) => [key, 500])),
		infestedPlotProbability: 1,
	});

	const fortune = player.breakdown;

	expect(fortune).toStrictEqual({
		'Attribute Shards': { value: 90, stat: Stat.FarmingFortune },
	});
});

test('Attribute shards upgrade test', () => {
	const player = new FarmingPlayer({
		attributes: {
			SHARD_LUNAR_MOTH: 25,
			SHARD_GALAXY_FISH: 19,
		},
	});

	const upgrades = player.getUpgrades();

	const lunarMoth = upgrades.find((u) => u.title.startsWith('Lunar Moth 10'));
	expect(lunarMoth).toBeDefined();

	const galaxyFish = upgrades.find((u) => u.title.startsWith('Galaxy Fish 10'));
	expect(galaxyFish).toBeDefined();
});

test('Crop specific pet fortune test', () => {
	const player = new FarmingPlayer({
		pets: [
			new FarmingPet({
				uuid: '5adcc2e9-56b1-46dd-9a6e-18d082422604',
				type: 'MOSQUITO',
				exp: 1491022.3152000662,
				active: false,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			}),
		],
		uniqueVisitors: 71,
	});

	player.selectPet(player.pets[0]);

	const cropFortune = player.getCropFortune(Crop.SugarCane);
	expect(cropFortune).toBeDefined();

	expect(cropFortune.breakdown).toStrictEqual({
		Mosquito: { value: 86.62, stat: Stat.SugarCaneFortune },
	});
});

test('Axed perk should work through FarmingPlayer', () => {
	const axe = {
		id: 258,
		count: 1,
		skyblockId: 'COCO_CHOPPER_3',
		uuid: 'test-axe-uuid',
		name: '§6Cocoa Chopper',
		lore: ['§7Farming Fortune: §a+100', '', '§6§lLEGENDARY AXE'],
		enchantments: {},
		attributes: {
			modifier: 'bountiful',
			farming_for_dummies_count: '5',
		},
	};

	// Test with string "1"
	const playerWithString = new FarmingPlayer({
		tools: [axe],
		perks: {
			axed: '1',
		},
	});

	const toolWithString = playerWithString.tools[0];
	expect(toolWithString).toBeDefined();
	expect(toolWithString.hasAxedPerk()).toBe(true);
	expect(toolWithString.fortuneBreakdown['Axed Perk']).toBeGreaterThan(0);

	// Test with number 1
	const playerWithNumber = new FarmingPlayer({
		tools: [axe],
		perks: {
			axed: 1,
		},
	});

	const toolWithNumber = playerWithNumber.tools[0];
	expect(toolWithNumber).toBeDefined();
	expect(toolWithNumber.hasAxedPerk()).toBe(true);
	expect(toolWithNumber.fortuneBreakdown['Axed Perk']).toBeGreaterThan(0);

	// Check the progress includes Axed Perk entry
	const progress = toolWithNumber.getProgress();
	const axedProgress = progress.find((p) => p.name === 'Axed Perk');
	expect(axedProgress).toBeDefined();
	expect(axedProgress?.current).toBeGreaterThan(0);
	expect(axedProgress?.max).toBeGreaterThan(0);

	// Now test without the perk
	const playerWithoutPerk = new FarmingPlayer({
		tools: [axe],
		perks: {},
	});

	const toolWithoutPerk = playerWithoutPerk.tools[0];
	expect(toolWithoutPerk).toBeDefined();
	expect(toolWithoutPerk.hasAxedPerk()).toBe(false);
	expect(toolWithoutPerk.fortuneBreakdown['Axed Perk']).toBeUndefined();

	// Check progress shows perk as available upgrade
	const progressWithoutPerk = toolWithoutPerk.getProgress();
	const axedProgressWithoutPerk = progressWithoutPerk.find((p) => p.name === 'Axed Perk');
	expect(axedProgressWithoutPerk).toBeDefined();
	expect(axedProgressWithoutPerk?.current).toBe(0);
	expect(axedProgressWithoutPerk?.upgrades).toBeDefined();
});
