import { expect, test } from 'vitest';
import { Stat } from '../../constants/stats.js';
import { UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import { FARMING_ACCESSORIES_INFO } from '../../items/accessories.js';
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
		dnaMilestone: 3,
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
		},
		{
			name: 'Garden Chips',
			current: 0,
			max: 100,
			ratio: 0,
			alwaysInclude: true,
		},
		{
			name: 'Garden Bestiary',
			current: 6 * 0.4,
			max: 100,
			ratio: (6 * 0.4) / 100,
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
			name: 'Helianthus Relic',
			current: 0,
			max: 40,
			ratio: 0,
		},
		{
			name: 'Freshly Baked Heirloom',
			current: 0,
			max: 0,
			ratio: 0,
		},
		{
			name: 'DNA Analysis Milestone',
			current: 3 * 5,
			max: 30,
			ratio: 3 / 6,
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
		{
			name: 'Atmospheric Filter',
			current: 0,
			max: 25,
			ratio: 0,
		},
		{
			name: 'Refined Dark Cacao Truffle',
			current: 0,
			max: 5,
			ratio: 0,
		},
		{
			name: 'Filled Rosewater Flask',
			api: false,
			current: 0,
			max: 5,
			ratio: 0,
		},
		{
			name: 'Fortunate Feasting',
			current: 0,
			max: 25,
			ratio: 0,
		},
	]);
});

test('Cropeetle shard surfaces Overbloom progress and upgrade under Attribute Shards', () => {
	// Cropeetle is Rare. Leveling thresholds: [1, 2, 3, 3, 4, 4, 5, 6, 8, 12]
	// 13 shards = level 5 (1+2+3+3+4 = 13). Each level grants +2 Overbloom.
	const player = new FarmingPlayer({
		attributes: { crop_bug: 13 },
	});

	const progress = player.getProgress([Stat.FarmingFortune, Stat.Overbloom]);
	const attributeShards = progress.find((p) => p.name === 'Attribute Shards');
	expect(attributeShards).toBeDefined();

	// Cropeetle (Rare, max level 10) provides 20 Overbloom max and we are at 10.
	expect(attributeShards?.stats?.[Stat.Overbloom]).toMatchObject({
		current: 10,
		max: 20,
	});

	// Drilling into Attribute Shards should reveal the Cropeetle shard with Overbloom progress.
	const cropeetle = attributeShards?.progress?.find((p) => p.name === 'Cropeetle Shard');
	expect(cropeetle).toBeDefined();
	expect(cropeetle?.stats?.[Stat.Overbloom]).toMatchObject({
		current: 10,
		max: 20,
	});

	// And Cropeetle should appear as an Overbloom upgrade (level 6 gives +2 Overbloom, costs 4 shards).
	const overbloomUpgrades = player.getUpgrades({ stat: Stat.Overbloom });
	const cropeetleUpgrade = overbloomUpgrades.find((u) => u.title === 'Cropeetle 6');
	expect(cropeetleUpgrade).toMatchObject({
		action: UpgradeAction.LevelUp,
		category: UpgradeCategory.Attribute,
		cost: {
			items: { SHARD_CROPEETLE: 4 },
		},
	});
	expect(cropeetleUpgrade?.stats?.[Stat.Overbloom]).toBe(2);

	// Should NOT appear in plain FarmingFortune upgrades (no FF impact).
	const ffUpgrades = player.getUpgrades({ stat: Stat.FarmingFortune });
	expect(ffUpgrades.find((u) => u.title === 'Cropeetle 6')).toBeUndefined();
});

test('Freshly Baked Talisman purchase costs 25 kernels', () => {
	const player = new FarmingPlayer({});

	const overbloomUpgrades = player.getUpgrades({ stat: Stat.Overbloom });
	const talismanPurchase = overbloomUpgrades.find((u) => u.title === 'Freshly Baked Talisman');
	expect(talismanPurchase).toBeDefined();
	expect(talismanPurchase?.action).toBe(UpgradeAction.Purchase);
	expect(talismanPurchase?.cost?.kernels).toBe(25);
	expect(talismanPurchase?.cost?.items).toBeUndefined();
});

test('Freshly Baked accessory tier-up costs use kernels currency', () => {
	expect(FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_TALISMAN?.upgrade?.cost?.kernels).toBe(100);
	expect(FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_RING?.upgrade?.cost?.kernels).toBe(250);
	expect(FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_ARTIFACT?.upgrade?.cost?.kernels).toBe(500);
	expect(FARMING_ACCESSORIES_INFO.FRESHLY_BAKED_RELIC?.upgrade?.cost?.kernels).toBe(1000);
});

test('Harvest Feast perk progress can be passed through explicit feast options', () => {
	const player = new FarmingPlayer({
		harvestFeast: {
			active: false,
			perks: {
				natural_talent: 3,
				fortunate_feasting: 4,
				feast_crashers: 2,
			},
		},
	});

	const progress = player.getProgress([Stat.FarmingFortune, Stat.Overbloom]);
	const naturalTalent = progress.find((p) => p.name === 'Natural Talent');
	const fortunateFeasting = progress.find((p) => p.name === 'Fortunate Feasting');

	expect(naturalTalent?.progress?.[0]).toMatchObject({
		name: 'Level',
		current: 3,
		max: 5,
	});
	expect(naturalTalent?.stats?.[Stat.Overbloom]).toMatchObject({
		current: 0,
		max: 5,
	});
	expect(naturalTalent?.active?.stats?.[Stat.Overbloom]).toBe(3);

	expect(fortunateFeasting?.progress?.[0]).toMatchObject({
		name: 'Level',
		current: 4,
		max: 5,
	});
	expect(fortunateFeasting?.stats?.[Stat.FarmingFortune]).toMatchObject({
		current: 0,
		max: 25,
	});
	expect(fortunateFeasting?.active?.fortune).toBe(20);
	expect(fortunateFeasting?.active?.stats?.[Stat.FarmingFortune]).toBe(20);
	expect(progress.find((p) => p.name === 'Feast Crashers')).toBeUndefined();
});

test('Harvest Feast perk levels contribute while feast is active', () => {
	const player = new FarmingPlayer({
		harvestFeast: {
			active: true,
			perks: {
				natural_talent: 3,
				fortunate_feasting: 4,
			},
		},
	});

	expect(player.getStat(Stat.Overbloom)).toBe(3);
	expect(player.getStat(Stat.FarmingFortune)).toBe(20);
});
