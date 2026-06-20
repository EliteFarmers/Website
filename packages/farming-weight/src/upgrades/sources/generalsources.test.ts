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
	// 13 shards = level 5 (1+2+3+3+4 = 13). Each level grants +1 normal Overbloom.
	const player = new FarmingPlayer({
		attributes: { crop_bug: 13 },
	});

	const progress = player.getProgress([Stat.FarmingFortune, Stat.Overbloom]);
	const attributeShards = progress.find((p) => p.name === 'Attribute Shards');
	expect(attributeShards).toBeDefined();

	expect(attributeShards?.stats?.[Stat.Overbloom]).toMatchObject({
		current: 5,
		max: 30,
		ratio: 5 / 30,
	});
	expect(attributeShards?.effects).toContainEqual(
		expect.objectContaining({
			source: 'Cropeetle Shard',
			op: 'add-rare-pct',
			value: 5,
			description: 'Normal Overbloom',
			relatedStats: [Stat.Overbloom],
			valueDisplay: 'stat',
			valueStat: Stat.Overbloom,
		})
	);

	// Drilling into Attribute Shards should reveal the Cropeetle shard as an Overbloom-related effect.
	const cropeetle = attributeShards?.progress?.find((p) => p.name === 'Cropeetle Shard');
	expect(cropeetle).toBeDefined();
	expect(cropeetle?.stats?.[Stat.Overbloom]).toMatchObject({
		current: 5,
		max: 10,
		ratio: 0.5,
	});
	expect(cropeetle?.effects).toContainEqual(
		expect.objectContaining({
			source: 'Cropeetle Shard',
			op: 'add-rare-pct',
			value: 5,
			description: 'Normal Overbloom',
			relatedStats: [Stat.Overbloom],
			valueDisplay: 'stat',
			valueStat: Stat.Overbloom,
		})
	);

	// And Cropeetle should appear as an Overbloom-related upgrade (level 6 costs 4 shards).
	const overbloomUpgrades = player.getUpgrades({ stat: Stat.Overbloom });
	const cropeetleUpgrade = overbloomUpgrades.find((u) => u.title === 'Cropeetle 6');
	expect(cropeetleUpgrade).toMatchObject({
		action: UpgradeAction.LevelUp,
		category: UpgradeCategory.Attribute,
		cost: {
			items: { SHARD_CROPEETLE: 4 },
		},
	});
	expect(cropeetleUpgrade?.stats?.[Stat.Overbloom]).toBe(1);
	expect(cropeetleUpgrade?.effects).toContainEqual(
		expect.objectContaining({
			source: 'Cropeetle Shard',
			op: 'add-rare-pct',
			value: 6,
			description: 'Normal Overbloom',
			relatedStats: [Stat.Overbloom],
			valueDisplay: 'stat',
			valueStat: Stat.Overbloom,
		})
	);

	// Should NOT appear in plain FarmingFortune upgrades (no FF impact).
	const ffUpgrades = player.getUpgrades({ stat: Stat.FarmingFortune });
	expect(ffUpgrades.find((u) => u.title === 'Cropeetle 6')).toBeUndefined();
});

test('Pest shard surfaces pest-specific flat Overbloom progress under Attribute Shards', () => {
	const player = new FarmingPlayer({
		attributes: { pest_luck: 15 },
	});

	const progress = player.getProgress([Stat.FarmingFortune, Stat.Overbloom]);
	const attributeShards = progress.find((p) => p.name === 'Attribute Shards');
	const pestShard = attributeShards?.progress?.find((p) => p.name === 'Pest Shard');

	expect(attributeShards?.stats?.[Stat.Overbloom]).toMatchObject({
		current: 10,
		max: 30,
		ratio: 10 / 30,
	});
	expect(pestShard?.stats?.[Stat.Overbloom]).toMatchObject({
		current: 10,
		max: 20,
		ratio: 0.5,
	});
	expect(pestShard?.effects).toContainEqual(
		expect.objectContaining({
			source: 'Pest Shard',
			op: 'add-rare-pct',
			value: 10,
			scope: { tags: ['pest'] },
			description: 'Pest Overbloom',
			relatedStats: [Stat.Overbloom],
			valueDisplay: 'stat',
			valueStat: Stat.Overbloom,
		})
	);
});

test('progress-only garden chips show one nested progress bar', () => {
	const player = new FarmingPlayer({
		chips: { synthesis: 4, cropshot: 4 },
	});

	const chips = player.getProgress([Stat.FarmingFortune, Stat.Overbloom]).find((p) => p.name === 'Garden Chips');
	const synthesis = chips?.progress?.find((p) => p.name === 'Synthesis Chip');
	const cropshot = chips?.progress?.find((p) => p.name === 'Cropshot Chip');

	expect(synthesis?.stats).toBeUndefined();
	expect(synthesis?.progress?.map((p) => p.name)).toStrictEqual(['Level']);
	expect(cropshot?.stats?.[Stat.FarmingFortune]).toBeDefined();
	expect(cropshot?.progress?.map((p) => p.name)).toStrictEqual(['Level', 'Rarity']);
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

test('zero-delta general upgrades remain visible for multi-stat fortune queries', () => {
	const player = new FarmingPlayer({});

	const upgrades = player.getUpgrades({ stats: [Stat.FarmingFortune, Stat.Overbloom] });
	const relic = upgrades.find((u) => u.title === 'Relic of Power');

	expect(relic).toBeDefined();
	expect(relic?.increase).toBe(0);
	expect(relic?.stats).toEqual({ [Stat.FarmingFortune]: 0 });
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

	const progress = player.getProgress([Stat.FarmingFortune, Stat.Overbloom, Stat.BonusPestChance]);
	const naturalTalent = progress.find((p) => p.name === 'Natural Talent');
	const fortunateFeasting = progress.find((p) => p.name === 'Fortunate Feasting');
	const feastCrashers = progress.find((p) => p.name === 'Feast Crashers');

	expect(naturalTalent?.progress?.[0]).toMatchObject({
		name: 'Level',
		current: 3,
		max: 5,
	});
	expect(naturalTalent?.stats?.[Stat.Overbloom]).toBeUndefined();
	expect(naturalTalent?.active?.stats?.[Stat.Overbloom]).toBeUndefined();
	expect(naturalTalent?.effects).toContainEqual({
		source: 'Natural Talent',
		op: 'add-rare-pct',
		value: 3,
		scope: { tags: ['seasoning'], requiresHarvestFeast: true },
		description: '+1% Seasoning chance per level during Harvest Feast',
		valueDisplay: 'percent',
		valueStat: undefined,
	});

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
	expect(feastCrashers?.progress?.[0]).toMatchObject({
		name: 'Level',
		current: 2,
		max: 3,
	});
	expect(feastCrashers?.stats?.[Stat.BonusPestChance]).toMatchObject({
		current: 0,
		max: 6,
	});
	expect(feastCrashers?.active?.stats?.[Stat.BonusPestChance]).toBe(4);
});

test('Harvest Feast perk levels contribute while feast is active', () => {
	const player = new FarmingPlayer({
		harvestFeast: {
			active: true,
			perks: {
				natural_talent: 3,
				fortunate_feasting: 4,
				feast_crashers: 3,
			},
		},
	});

	expect(player.getStat(Stat.Overbloom)).toBe(0);
	expect(player.getStat(Stat.FarmingFortune)).toBe(20);
	expect(player.getStat(Stat.BonusPestChance)).toBe(6);
});
