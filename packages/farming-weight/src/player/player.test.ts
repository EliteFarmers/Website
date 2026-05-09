import { expect, test } from 'vitest';
import { FARMING_ATTRIBUTE_SHARDS } from '../constants/attributes.js';
import { Crop } from '../constants/crops.js';
import { Rarity } from '../constants/reforge-types.js';
import { Stat } from '../constants/stats.js';
import { UpgradeAction, UpgradeCategory, type FortuneUpgrade } from '../constants/upgrades.js';
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

test('stat view supports Bonus Pest Chance without Farming Fortune upgrades', () => {
	const player = new FarmingPlayer({
		chips: {
			vermin_vaporizer: 7,
		},
	});

	const view = player.getStatView({ stats: [Stat.BonusPestChance] });

	expect(view.totals[Stat.BonusPestChance]).toBe(21);
	expect(view.breakdowns[Stat.BonusPestChance]?.['Vermin Vaporizer Chip']).toStrictEqual({
		value: 21,
		stat: Stat.BonusPestChance,
	});
	expect(view.upgrades.find((u) => u.title === 'Wriggling Larva')).toBeDefined();
	expect(view.upgrades.find((u) => u.title.startsWith('Farming Level'))).toBeUndefined();
});

test('multi-stat upgrade queries surface Farming Fortune and Overbloom upgrades together', () => {
	const player = new FarmingPlayer({
		farmingLevel: 50,
		attributes: {
			crop_bug: 13,
		},
	});

	const view = player.getStatView({ stats: [Stat.FarmingFortune, Stat.Overbloom] });

	expect(view.upgrades.find((u) => u.title === 'Farming Level 51')).toBeDefined();
	expect(view.upgrades.find((u) => u.title === 'Cropeetle 6')).toBeDefined();
	expect(view.upgrades.find((u) => u.title === 'Wriggling Larva')).toBeUndefined();
});

test('multi-stat upgrade queries keep Bountiful as the preferred farming tool reforge', () => {
	const player = new FarmingPlayer({
		selectedCrop: Crop.Wheat,
		tools: [
			{
				id: 291,
				count: 1,
				skyblockId: 'THEORETICAL_HOE_WHEAT_1',
				uuid: 'blessed-wheat-hoe',
				name: "Euclid's Wheat Hoe",
				lore: [],
				enchantments: {},
				attributes: { modifier: 'blessed' },
				gems: {},
			},
		],
	});

	const upgrades = player.getUpgrades({ stats: [Stat.FarmingFortune, Stat.Overbloom] });
	const reforges = upgrades.filter((upgrade) => upgrade.meta?.type === 'reforge');

	expect(reforges.find((upgrade) => upgrade.title === 'Reforge to Bountiful')).toBeDefined();
	expect(reforges.find((upgrade) => upgrade.title === 'Reforge to Overpriced')).toBeUndefined();
	expect(reforges.find((upgrade) => upgrade.title === 'Reforge to Blessed')).toBeUndefined();
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

test('getRates uses total active crop fortune for base crop collection', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		cropUpgrades: {
			[Crop.NetherWart]: 10,
		},
	});

	expect(player.fortune).toBe(80);
	expect(player.getCropFortune(Crop.NetherWart).fortune).toBe(130);

	const rates = player.getRates(Crop.NetherWart, 1_000);

	expect(rates.fortune).toBe(130);
	expect(rates.collection).toBe(5_750);
	expect(rates.items[Crop.NetherWart]).toBe(4_750);
});

test('getUpgradeRateImpact reports flat fortune crop output gains', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		cropUpgrades: {
			[Crop.NetherWart]: 0,
		},
	});
	const upgrade: FortuneUpgrade = {
		title: 'Nether Wart Fortune 1',
		increase: 5,
		stats: { [Stat.NetherWartFortune]: 5 },
		action: UpgradeAction.Upgrade,
		category: UpgradeCategory.Anita,
		meta: {
			type: 'crop_upgrade',
			key: Crop.NetherWart,
			value: 1,
		},
	};

	const impact = player.getUpgradeRateImpact(upgrade, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});

	expect(impact.delta.collection).toBe(9_000);
	expect(impact.delta.items[Crop.NetherWart]).toBe(9_000);
	expect(impact.delta.totalItems).toBe(9_000);
});

test('getUpgradeRateImpact applies exportable crop unlocks', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
	});
	const upgrade = player.getCropUpgrades(Crop.NetherWart).find((u) => u.title === 'Exportable Crop');

	expect(upgrade).toBeDefined();
	expect(upgrade?.increase).toBe(12);
	expect(upgrade?.stats?.[Stat.NetherWartFortune]).toBe(12);

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.options.exportableCrops?.[Crop.NetherWart]).toBe(true);
	expect(cloned.getCropFortune(Crop.NetherWart).fortune - player.getCropFortune(Crop.NetherWart).fortune).toBe(12);

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});

	expect(impact.delta.collection).toBe(21_600);
	expect(impact.delta.items[Crop.NetherWart]).toBe(21_600);
	expect(impact.delta.totalItems).toBe(21_600);
});

test('getUpgradeRateImpact applies setting-backed flat fortune upgrades', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		dnaMilestone: 4,
		refinedTruffles: 0,
	});

	const dnaUpgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === 'DNA Analysis Milestone 5');
	const truffleUpgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === 'Refined Dark Cacao Truffle');

	expect(dnaUpgrade).toBeDefined();
	expect(truffleUpgrade).toBeDefined();

	const dnaImpact = player.getUpgradeRateImpact(dnaUpgrade!, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});
	const truffleImpact = player.getUpgradeRateImpact(truffleUpgrade!, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});

	expect(dnaImpact.delta.totalItems).toBeGreaterThan(0);
	expect(truffleImpact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact refreshes newly purchased accessory effects', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		attributes: {
			wart_eater: 500,
		},
		harvestFeast: {
			active: true,
		},
	});

	const upgrade = player.getUpgrades({ stat: Stat.Overbloom }).find((u) => u.title === 'Freshly Baked Talisman');

	expect(upgrade).toBeDefined();

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.getStat(Stat.Overbloom)).toBe(2);

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
	});

	expect(impact.delta.rngItems.WARTY).toBeCloseTo(1, 2);
	expect(impact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact refreshes accessory tier replacements', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		accessories: [
			{
				skyblockId: 'FERMENTO_ARTIFACT',
				uuid: 'fermento-artifact',
				name: 'Fermento Artifact',
				lore: [],
				enchantments: {},
				attributes: {},
			},
		],
	});

	const upgrade = player.getCropUpgrades(Crop.NetherWart).find((u) => u.title === 'Helianthus Relic');

	expect(upgrade).toBeDefined();

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(player.getCropFortune(Crop.NetherWart).fortune).toBe(110);
	expect(cloned.getCropFortune(Crop.NetherWart).fortune).toBe(120);

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});

	expect(impact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact applies starting crop tool purchases', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
	});

	const upgrade = player.getCropUpgrades(Crop.Wheat).find((u) => u.meta?.type === 'buy_item');

	expect(upgrade).toBeDefined();
	expect(upgrade?.increase).toBe(4);

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.tools.some((tool) => tool.info.skyblockId === 'THEORETICAL_HOE_WHEAT_1')).toBe(true);

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.Wheat,
		blocksBroken: 72_000,
	});

	expect(impact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact applies starting farm armor purchases', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
	});

	const upgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === 'Farm Armor Helmet');

	expect(upgrade).toBeDefined();
	expect(upgrade?.increase).toBeGreaterThan(0);
	expect(upgrade?.meta?.type).toBe('buy_item');

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.armor.some((piece) => piece.info.skyblockId === 'FARM_ARMOR_HELMET')).toBe(true);
	expect(cloned.armorSet.getPiece('Helmet')?.info.skyblockId).toBe('FARM_ARMOR_HELMET');

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.Wheat,
		blocksBroken: 72_000,
	});

	expect(impact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact applies starting lotus equipment purchases', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
	});

	const upgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === 'Lotus Cloak');

	expect(upgrade).toBeDefined();
	expect(upgrade?.increase).toBeGreaterThan(0);
	expect(upgrade?.meta?.type).toBe('buy_item');

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.equipment.some((piece) => piece.info.skyblockId === 'LOTUS_CLOAK')).toBe(true);
	expect(cloned.armorSet.getPiece('Cloak')?.info.skyblockId).toBe('LOTUS_CLOAK');

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.Wheat,
		blocksBroken: 72_000,
	});

	expect(impact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact applies special accessory purchases', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
	});

	const upgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === 'Magic 8 Ball');

	expect(upgrade).toBeDefined();

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.getStat(Stat.FarmingFortune)).toBeGreaterThan(player.getStat(Stat.FarmingFortune));

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.Wheat,
		blocksBroken: 72_000,
	});

	expect(impact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact refreshes item-backed stat mutations', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		armor: [
			{
				id: 305,
				skyblockId: 'FERMENTO_BOOTS',
				uuid: 'mossy-fermento-boots',
				name: 'Mossy Fermento Boots',
				lore: ['LEGENDARY BOOTS'],
				enchantments: {},
				attributes: {
					modifier: 'mossy',
				},
			},
		],
	});

	const recombobulate = player
		.getUpgrades({ stat: Stat.FarmingFortune })
		.find((u) => u.title === 'Recombobulate Mossy Fermento Boots');

	expect(recombobulate).toBeDefined();

	const impact = player.getUpgradeRateImpact(recombobulate!, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});

	expect(impact.delta.totalItems).toBeGreaterThan(0);
});

test('getUpgradeRateImpact can be negative when an armor tier upgrade lowers active special-crop set count', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		armor: [
			{
				id: 302,
				skyblockId: 'FERMENTO_HELMET',
				uuid: 'fermento-helmet',
				name: 'Mossy Fermento Helmet',
				lore: ['LEGENDARY HELMET'],
				enchantments: {},
				attributes: { modifier: 'mossy' },
			},
			{
				id: 303,
				skyblockId: 'FERMENTO_CHESTPLATE',
				uuid: 'fermento-chestplate',
				name: 'Mossy Fermento Chestplate',
				lore: ['LEGENDARY CHESTPLATE'],
				enchantments: {},
				attributes: { modifier: 'mossy' },
			},
			{
				id: 304,
				skyblockId: 'FERMENTO_LEGGINGS',
				uuid: 'fermento-leggings',
				name: 'Mossy Fermento Leggings',
				lore: ['LEGENDARY LEGGINGS'],
				enchantments: {},
				attributes: { modifier: 'mossy' },
			},
			{
				id: 305,
				skyblockId: 'FERMENTO_BOOTS',
				uuid: 'fermento-boots',
				name: 'Mossy Fermento Boots',
				lore: ['LEGENDARY BOOTS'],
				enchantments: {},
				attributes: { modifier: 'mossy' },
			},
		],
	});

	expect(player.armorSet.specialDropsCount(Crop.NetherWart)).toBe(4);

	const upgrade = player
		.getUpgrades({ stat: Stat.FarmingFortune })
		.find((u) => u.title === 'Helianthus Boots');

	expect(upgrade).toBeDefined();

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.armorSet.specialDropsCount(Crop.NetherWart)).toBe(3);

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});

	expect(impact.delta.totalItems).toBeLessThan(0);
});

function fermentoArmorItem(
	skyblockId: 'FERMENTO_HELMET' | 'FERMENTO_CHESTPLATE' | 'FERMENTO_LEGGINGS' | 'FERMENTO_BOOTS',
	uuid: string,
	name: string,
	rarity: 'EPIC' | 'LEGENDARY',
	recombobulated = rarity === 'LEGENDARY'
) {
	return {
		id: Number(uuid.replace(/\D/g, '') || 1),
		skyblockId,
		uuid,
		name,
		lore: [`${rarity} ${skyblockId.includes('HELMET') ? 'HELMET' : skyblockId.includes('BOOTS') ? 'BOOTS' : 'ARMOR'}`],
		enchantments: {
			pesterminator: 5,
		},
		attributes: {
			modifier: 'mossy',
			...(recombobulated ? { rarity_upgrades: '1' } : {}),
		},
		gems: {
			PERIDOT_0: 'PERFECT',
			PERIDOT_1: 'PERFECT',
		},
	};
}

function fermentoToHelianthusPlayer() {
	return new FarmingPlayer({
		farmingLevel: 60,
		armor: [
			fermentoArmorItem('FERMENTO_HELMET', 'fermento-helmet', 'Mossy Fermento Helmet', 'LEGENDARY'),
			fermentoArmorItem('FERMENTO_CHESTPLATE', 'fermento-chestplate', 'Mossy Fermento Chestplate', 'LEGENDARY'),
			fermentoArmorItem('FERMENTO_LEGGINGS', 'fermento-leggings', 'Mossy Fermento Leggings', 'LEGENDARY'),
			fermentoArmorItem('FERMENTO_BOOTS', 'fermento-boots', 'Mossy Fermento Boots', 'EPIC', false),
		],
	});
}

test('getUpgradeRateImpact reports special-crop drop losses when Fermento set count drops', () => {
	const player = fermentoToHelianthusPlayer();
	const upgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === 'Helianthus Helmet');

	expect(upgrade).toBeDefined();
	expect(player.armorSet.specialDropsCount(Crop.NetherWart)).toBe(4);
	expect(player.getRates(Crop.NetherWart, 72_000).items.FERMENTO).toBeCloseTo(5.04, 8);

	const cloned = player.clone();
	cloned.applyUpgrade(upgrade!);

	expect(cloned.armorSet.specialDropsCount(Crop.NetherWart)).toBe(3);
	expect(cloned.getRates(Crop.NetherWart, 72_000).items.FERMENTO).toBeCloseTo(4.32, 8);

	const impact = player.getUpgradeRateImpact(upgrade!, {
		crop: Crop.NetherWart,
		blocksBroken: 72_000,
	});

	expect(impact.delta.items.FERMENTO).toBeCloseTo(-0.72, 8);
	expect(impact.delta.coinSources.Fermento).toBeCloseTo(-180_000, 5);
});

test('armor tier upgrades preserve the upgraded item rarity for reforge and gem stats', () => {
	const player = fermentoToHelianthusPlayer();
	const helmet = player.armor.find((piece) => piece.item.uuid === 'fermento-helmet');
	const upgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === 'Helianthus Helmet');
	const cloned = player.clone();

	expect(helmet?.rarity).toBe(Rarity.Legendary);
	expect(upgrade).toBeDefined();

	cloned.applyUpgrade(upgrade!);
	const upgraded = cloned.armor.find((piece) => piece.item.uuid === 'fermento-helmet');

	expect(upgraded?.item.skyblockId).toBe('HELIANTHUS_HELMET');
	expect(upgraded?.rarity).toBe(Rarity.Mythic);
	expect(upgraded?.getStat(Stat.FarmingFortune)).toBeGreaterThan(helmet?.getStat(Stat.FarmingFortune) ?? 0);
});

test('sequential Fermento to Helianthus rate impacts follow active same-family set counts', () => {
	const player = fermentoToHelianthusPlayer();
	const blocksBroken = 72_000;

	const apply = (title: string) => {
		const upgrade = player.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.title === title);
		expect(upgrade).toBeDefined();
		const impact = player.getUpgradeRateImpact(upgrade!, {
			crop: Crop.NetherWart,
			blocksBroken,
		});
		player.applyUpgrade(upgrade!);
		return impact;
	};

	expect(player.armorSet.specialDropsCount(Crop.NetherWart)).toBe(4);

	const first = apply('Helianthus Helmet');
	expect(first.delta.items.FERMENTO).toBeCloseTo(-0.72, 8);
	expect(player.armorSet.specialDropsCount(Crop.NetherWart)).toBe(3);

	const second = apply('Helianthus Chestplate');
	expect(second.delta.items.FERMENTO).toBeCloseTo(-0.72, 8);
	expect(Math.abs(second.delta.npcCoins)).toBeLessThan(Math.abs(first.delta.npcCoins));
	expect(player.armorSet.specialDropsCount(Crop.NetherWart)).toBe(2);

	const third = apply('Helianthus Leggings');
	expect(third.delta.items.FERMENTO).toBeCloseTo(0.72, 8);
	expect(third.delta.npcCoins).toBeGreaterThan(0);
	expect(player.armorSet.specialDropsCount(Crop.NetherWart)).toBe(3);
});

test('getUpgrades can replace grouped armor tier rows with a single set upgrade', () => {
	const player = fermentoToHelianthusPlayer();
	const upgrades = player.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true });
	const group = upgrades.find((u) => u.meta?.type === 'upgrade_group');

	expect(group).toBeDefined();
	expect(upgrades[0]).toBe(group);
	expect(group?.title).toBe('Upgrade Fermento Armor to Helianthus Armor');
	expect(group?.group?.memberCount).toBe(4);
	expect(group?.groupedUpgrades?.map((u) => u.title)).toStrictEqual([
		'Helianthus Helmet',
		'Helianthus Chestplate',
		'Helianthus Leggings',
		'Helianthus Boots',
	]);
	expect(group?.cost?.items?.CONDENSED_HELIANTHUS).toBe(8);
	expect(group?.cost?.items?.COMPACTED_WILD_ROSE).toBe(192);
	expect(group?.conflictKey).toContain('upgrade_group:armor-tier:FERMENTO:HELIANTHUS');
	expect(upgrades.filter((u) => u.title.startsWith('Helianthus '))).toHaveLength(0);
});

test('single eligible armor tier upgrades do not create grouped rows', () => {
	const player = new FarmingPlayer({
		armor: [fermentoArmorItem('FERMENTO_HELMET', 'fermento-helmet', 'Mossy Fermento Helmet', 'LEGENDARY')],
	});

	const upgrades = player.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true });

	expect(upgrades.find((u) => u.meta?.type === 'upgrade_group')).toBeUndefined();
	expect(upgrades.find((u) => u.title === 'Helianthus Helmet')).toBeDefined();
});

test('partial armor tier upgrade groups include only currently available pieces', () => {
	const player = new FarmingPlayer({
		armor: [
			fermentoArmorItem('FERMENTO_CHESTPLATE', 'fermento-chestplate', 'Mossy Fermento Chestplate', 'LEGENDARY'),
			fermentoArmorItem('FERMENTO_BOOTS', 'fermento-boots', 'Mossy Fermento Boots', 'EPIC', false),
		],
	});

	const group = player
		.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true })
		.find((u) => u.meta?.type === 'upgrade_group');

	expect(group).toBeDefined();
	expect(group?.group?.memberCount).toBe(2);
	expect(group?.groupedUpgrades?.map((u) => u.title)).toStrictEqual(['Helianthus Chestplate', 'Helianthus Boots']);
	expect(group?.cost?.items?.CONDENSED_HELIANTHUS).toBe(4);
	expect(group?.cost?.items?.COMPACTED_WILD_ROSE).toBe(64);
	expect(player.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true }).find((u) => u.title === 'Helianthus Chestplate')).toBeUndefined();
	expect(player.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true }).find((u) => u.title === 'Helianthus Boots')).toBeUndefined();
});

test('applyUpgrade applies grouped armor upgrades atomically through the normal item upgrade path', () => {
	const player = fermentoToHelianthusPlayer();
	const group = player
		.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true })
		.find((u) => u.meta?.type === 'upgrade_group');

	expect(group).toBeDefined();

	player.applyUpgrade(group!);

	const byUuid = new Map(player.armor.map((piece) => [piece.item.uuid, piece]));
	expect(byUuid.get('fermento-helmet')?.item.skyblockId).toBe('HELIANTHUS_HELMET');
	expect(byUuid.get('fermento-chestplate')?.item.skyblockId).toBe('HELIANTHUS_CHESTPLATE');
	expect(byUuid.get('fermento-leggings')?.item.skyblockId).toBe('HELIANTHUS_LEGGINGS');
	expect(byUuid.get('fermento-boots')?.item.skyblockId).toBe('HELIANTHUS_BOOTS');
	expect(byUuid.get('fermento-helmet')?.rarity).toBe(Rarity.Mythic);
	expect(byUuid.get('fermento-helmet')?.item.attributes?.modifier).toBe('mossy');
	expect(byUuid.get('fermento-helmet')?.item.gems?.PERIDOT_0).toBe('PERFECT');
	expect(byUuid.get('fermento-boots')?.rarity).toBe(Rarity.Legendary);
});

test('grouped armor tier rate impact matches applying member upgrades sequentially', () => {
	const player = fermentoToHelianthusPlayer();
	const blocksBroken = 72_000;
	const group = player
		.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true })
		.find((u) => u.meta?.type === 'upgrade_group');

	expect(group).toBeDefined();

	const groupedImpact = player.getUpgradeRateImpact(group!, {
		crop: Crop.NetherWart,
		blocksBroken,
	});

	const sequential = player.clone();
	const before = sequential.getRates(Crop.NetherWart, blocksBroken);
	for (const upgrade of group?.groupedUpgrades ?? []) {
		sequential.applyUpgrade(upgrade);
	}
	const after = sequential.getRates(Crop.NetherWart, blocksBroken);

	expect(groupedImpact.before.items.FERMENTO).toBeCloseTo(before.items.FERMENTO, 8);
	expect(groupedImpact.after.items.FERMENTO).toBeCloseTo(after.items.FERMENTO, 8);
	expect(groupedImpact.delta.items.FERMENTO ?? 0).toBeCloseTo(0, 8);
	expect(groupedImpact.delta.collection).toBeCloseTo(after.collection - before.collection, 8);
	expect(groupedImpact.delta.npcCoins).toBeCloseTo(after.npcCoins - before.npcCoins, 5);
	expect(groupedImpact.delta.npcCoins).toBeGreaterThan(0);
});

test('expandUpgrade exposes grouped armor members in application order', () => {
	const player = fermentoToHelianthusPlayer();
	const group = player
		.getUpgrades({ stat: Stat.FarmingFortune, includeUpgradeGroups: true })
		.find((u) => u.meta?.type === 'upgrade_group');

	expect(group).toBeDefined();

	const tree = player.expandUpgrade(group!, {
		crop: Crop.NetherWart,
		stats: [Stat.FarmingFortune],
	});

	expect(tree.upgrade).toBe(group);
	expect(tree.children.map((child) => child.upgrade.title)).toStrictEqual([
		'Helianthus Helmet',
		'Helianthus Chestplate',
		'Helianthus Leggings',
		'Helianthus Boots',
	]);
	expect(tree.statsGained[Stat.FarmingFortune]).toBeGreaterThan(0);
	expect(tree.children[0].statsGained[Stat.FarmingFortune]).toBeLessThan(0);
	expect(tree.children[2].statsGained[Stat.FarmingFortune]).toBeGreaterThan(0);
});

test('getUpgradeRateImpact reports normal Overbloom RNG gains', () => {
	const player = new FarmingPlayer({
		farmingLevel: 20,
		attributes: {
			wart_eater: 500,
		},
	});
	const upgrade: FortuneUpgrade = {
		title: 'Rarefinder Chip 20',
		increase: 0,
		stats: { [Stat.Overbloom]: 60 },
		action: UpgradeAction.LevelUp,
		category: UpgradeCategory.Misc,
		meta: {
			type: 'chip',
			id: 'rarefinder',
			value: 20,
		},
	};

	const impact = player.getUpgradeRateImpact(upgrade, {
		crop: Crop.NetherWart,
		blocksBroken: 100_000,
	});

	expect(impact.delta.collection).toBe(0);
	expect(impact.delta.rngItems.WARTY).toBeCloseTo(30, 2);
	expect(impact.delta.totalItems).toBeCloseTo(30, 2);
});

test('getUpgradeRateImpact reports Seasoning gains as currency-only output', () => {
	const player = new FarmingPlayer({
		harvestFeast: {
			active: true,
			inSeasonCrops: [Crop.NetherWart],
		},
		tools: [
			{
				id: 293,
				count: 1,
				skyblockId: 'THEORETICAL_HOE_WARTS_1',
				uuid: 'impact-wart-hoe',
				name: 'Newton Nether Warts Hoe',
				lore: ['LEGENDARY HOE'],
				enchantments: {},
				attributes: {},
			},
		],
	});
	const upgrade: FortuneUpgrade = {
		title: 'Reforge to Deep Fried',
		increase: 23,
		stats: { [Stat.FarmingFortune]: 23 },
		action: UpgradeAction.Apply,
		category: UpgradeCategory.Reforge,
		meta: {
			type: 'reforge',
			id: 'deep_fried',
			itemUuid: 'impact-wart-hoe',
		},
	};

	const impact = player.getUpgradeRateImpact(upgrade, {
		crop: Crop.NetherWart,
		blocksBroken: 225_000,
	});
	const itemDeltaTotal =
		Object.values(impact.delta.items).reduce((sum, value) => sum + value, 0) +
		Object.values(impact.delta.rngItems).reduce((sum, value) => sum + value, 0);

	expect(impact.delta.currencies.SEASONING).toBeCloseTo(25, 8);
	expect(impact.delta.rngItems.SEASONING).toBeUndefined();
	expect(impact.delta.coinSources.SEASONING).toBeUndefined();
	expect(impact.delta.totalItems).toBeCloseTo(itemDeltaTotal, 8);
	expect(impact.delta.totalItems).not.toBeCloseTo(itemDeltaTotal + impact.delta.currencies.SEASONING, 8);
});

test('getUpgradeRateImpact reports scoped Cropeetle special-crop gains only where applicable', () => {
	const player = fermentoToHelianthusPlayer();
	const upgrade: FortuneUpgrade = {
		title: 'Cropeetle 1',
		increase: 0,
		effects: [
			{
				source: 'Cropeetle Shard',
				op: 'mul-rare',
				value: 1.02,
				relatedStats: [Stat.Overbloom],
			},
		],
		action: UpgradeAction.LevelUp,
		category: UpgradeCategory.Attribute,
		meta: {
			type: 'attribute',
			key: 'crop_bug',
			value: 1,
		},
	};

	const cactusImpact = player.getUpgradeRateImpact(upgrade, {
		crop: Crop.Cactus,
		blocksBroken: 100_000,
	});
	const mushroomImpact = player.getUpgradeRateImpact(upgrade, {
		crop: Crop.Mushroom,
		blocksBroken: 100_000,
	});

	expect(cactusImpact.delta.totalItems).toBeGreaterThan(0);
	expect(cactusImpact.delta.collection).toBe(0);
	expect(mushroomImpact.delta.totalItems).toBeGreaterThan(0);
	expect(mushroomImpact.delta.rngItems.BURROWING_SPORES ?? 0).toBe(0);
});

test('getRates includes Tool Exp Capsules for maxed crop tools', () => {
	const player = new FarmingPlayer({
		tools: [
			{
				id: 293,
				count: 1,
				skyblockId: 'THEORETICAL_HOE_WARTS_3',
				uuid: 'maxed-nether-wart-hoe',
				name: 'Maxed Newton Nether Warts Hoe',
				lore: [],
				enchantments: {},
				attributes: {
					levelable_lvl: '50',
					levelable_exp: '0',
				},
			},
		],
	});

	const rates = player.getRates(Crop.NetherWart, 100_000);

	expect(rates.items['TOOL_EXP_CAPSULE']).toBe(1);
	expect(rates.otherCollection['Tool Exp Capsule']).toBe(1);
	expect(rates.coinSources['Tool Exp Capsule']).toBe(100_000);
});

test('Sunset enchantment grants daytime Overbloom and affects player rate calculations', () => {
	const player = new FarmingPlayer({
		armor: [
			{
				id: 300,
				skyblockId: 'FERMENTO_LEGGINGS',
				uuid: 'sunset-leggings',
				name: '§6Fermento Leggings',
				lore: [],
				enchantments: {
					ultimate_sunset: 5,
				},
				attributes: {},
			},
		],
		attributes: {
			wart_eater: 500,
		},
	});

	expect(player.getStat(Stat.Overbloom)).toBe(0);
	expect(player.getStat(Stat.Overbloom, Crop.NetherWart)).toBe(5);
	expect(player.getStat(Stat.Overbloom, Crop.Moonflower)).toBe(0);

	const rates = player.getRates(Crop.NetherWart, 100_000);
	expect(rates.rngItems?.['WARTY']).toBeCloseTo(50 * 1.05, 2);
	expect(Object.values(rates.effectsBreakdown).some((v) => v === 5)).toBe(true);

	const moonflowerRates = player.getRates(Crop.Moonflower, 100_000);
	expect(Object.values(moonflowerRates.effectsBreakdown)).not.toContain(5);
});

test('Feast enchantment grants tool Overbloom for player rate calculations', () => {
	const player = new FarmingPlayer({
		tools: [
			{
				id: 293,
				count: 1,
				skyblockId: 'THEORETICAL_HOE_WARTS_3',
				uuid: 'feast-nether-wart-hoe',
				name: '§6Newton Nether Warts Hoe',
				lore: [],
				enchantments: {
					feast: 5,
				},
				attributes: {},
			},
		],
		attributes: {
			wart_eater: 500,
		},
	});

	const tool = player.getBestTool(Crop.NetherWart);
	expect(tool?.getStat(Stat.Overbloom, Crop.NetherWart)).toBe(10);

	const rates = player.getRates(Crop.NetherWart, 100_000);
	expect(rates.rngItems?.['WARTY']).toBeCloseTo(50 * 1.1, 2);
});

test('Freshly Baked accessories double Overbloom during Harvest Feast', () => {
	const freshlyBakedTalisman = {
		skyblockId: 'FRESHLY_BAKED_TALISMAN',
		uuid: 'freshly-baked-talisman',
		name: 'Freshly Baked Talisman',
		lore: [],
		attributes: {},
		enchantments: {},
	};

	const inactive = new FarmingPlayer({
		accessories: [freshlyBakedTalisman],
	});
	expect(inactive.getStat(Stat.Overbloom)).toBe(1);

	const active = new FarmingPlayer({
		accessories: [freshlyBakedTalisman],
		harvestFeast: {
			active: true,
		},
	});
	expect(active.getStat(Stat.Overbloom)).toBe(2);
	expect(active.getStatBreakdown(Stat.Overbloom)['Freshly Baked Talisman']?.value).toBe(2);
});

test('Selected crop Overbloom upgrades only include that crop tool', () => {
	const player = new FarmingPlayer({
		selectedCrop: Crop.Melon,
		tools: [
			{
				id: 293,
				count: 1,
				skyblockId: 'FUNGI_CUTTER',
				uuid: 'fungi-cutter-overbloom',
				name: '§aFungi Cutter',
				lore: [],
				enchantments: {},
				attributes: {},
			},
			{
				id: 279,
				count: 1,
				skyblockId: 'MELON_DICER',
				uuid: 'melon-dicer-overbloom',
				name: '§aMelon Dicer',
				lore: [],
				enchantments: {},
				attributes: {},
			},
		],
	});

	const overbloomUpgrades = player.getUpgrades({ stat: Stat.Overbloom });
	const feastUpgrades = overbloomUpgrades.filter((upgrade) => upgrade.title === 'Feast 1');

	expect(feastUpgrades.some((upgrade) => upgrade.meta?.itemUuid === 'melon-dicer-overbloom')).toBe(true);
	expect(feastUpgrades.some((upgrade) => upgrade.meta?.itemUuid === 'fungi-cutter-overbloom')).toBe(false);
});

test('Rarefinder chip grants Overbloom for player rate calculations', () => {
	const player = new FarmingPlayer({
		chips: {
			rarefinder: 20,
		},
		attributes: {
			wart_eater: 500,
		},
	});

	expect(player.getStat(Stat.Overbloom)).toBe(60);

	const rates = player.getRates(Crop.NetherWart, 100_000);
	expect(rates.rngItems?.['WARTY']).toBeCloseTo(50 * 1.6, 2);
});

test('Rose Dragon grants Overbloom for player rate calculations', () => {
	const player = new FarmingPlayer({
		pets: [
			{
				uuid: 'rose-dragon-overbloom',
				type: 'ROSE_DRAGON',
				exp: 10 ** 20,
				active: true,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			},
		],
	});

	expect(player.getStat(Stat.Overbloom)).toBe(40);

	const rates = player.getRates(Crop.Mushroom, 350_000);
	expect(rates.rngItems?.['BURROWING_SPORES']).toBeCloseTo(1 * 1.4, 2);
});

test('Rose Dragon Symbiosis does not count as Rose Dragon Overbloom', () => {
	const maxedPetTypes = [
		'BEE',
		'CHICKEN',
		'ELEPHANT',
		'HEDGEHOG',
		'MOOSHROOM_COW',
		'MOSQUITO',
		'PIG',
		'RABBIT',
		'SLUG',
	];

	const player = new FarmingPlayer({
		pets: [
			{
				uuid: 'rose-dragon-overbloom-with-symbiosis',
				type: 'ROSE_DRAGON',
				exp: 10 ** 20,
				active: true,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			},
			...maxedPetTypes.map((type) => ({
				uuid: `maxed-${type.toLowerCase()}`,
				type,
				exp: 10 ** 20,
				active: false,
				tier: 'LEGENDARY',
				heldItem: null,
				candyUsed: 0,
				skin: null,
			})),
		],
	});

	const breakdown = player.getStatBreakdown(Stat.Overbloom);

	expect(breakdown['Rose Dragon']).toStrictEqual({
		value: 40,
		stat: Stat.Overbloom,
	});
	expect(player.getStat(Stat.Overbloom)).toBe(40);
});
