import { expect, test } from 'vitest';
import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { FarmingTool } from './farmingtool.js';
import type { EliteItemDto } from './item.js';
import { Vacuum } from './vacuum.js';

const vacuumIds = [
	'SKYMART_VACUUM',
	'SKYMART_TURBO_VACUUM',
	'SKYMART_HYPER_VACUUM',
	'INFINI_VACUUM',
	'INFINI_VACUUM_HOOVERIUS',
] as const;

const vacuumStats = {
	SKYMART_VACUUM: { rarity: Rarity.Common, fortune: 5, damage: 100 },
	SKYMART_TURBO_VACUUM: { rarity: Rarity.Uncommon, fortune: 10, damage: 120 },
	SKYMART_HYPER_VACUUM: { rarity: Rarity.Rare, fortune: 15, damage: 150 },
	INFINI_VACUUM: { rarity: Rarity.Epic, fortune: 20, damage: 200 },
	INFINI_VACUUM_HOOVERIUS: { rarity: Rarity.Legendary, fortune: 25, damage: 250 },
} satisfies Record<(typeof vacuumIds)[number], { rarity: Rarity; fortune: number; damage: number }>;

function vacuum(id: (typeof vacuumIds)[number], overrides: Partial<EliteItemDto> = {}): EliteItemDto {
	const stats = vacuumStats[id];
	return {
		name: stats.rarity === Rarity.Legendary ? '§6InfiniVacuum™ Hooverius' : `§f${id}`,
		skyblockId: id,
		uuid: id,
		lore: [],
		attributes: { rarity: stats.rarity, ...(overrides.attributes ?? {}) },
		enchantments: overrides.enchantments ?? {},
		gems: overrides.gems ?? {},
		...overrides,
	};
}

test('all Garden vacuums parse as vacuums with base stats', () => {
	const tools = FarmingTool.fromArray(vacuumIds.map((id) => vacuum(id)));
	const vacuums = Vacuum.fromArray(vacuumIds.map((id) => vacuum(id)));

	expect(tools).toHaveLength(0);
	expect(vacuums).toHaveLength(5);

	for (const vacuum of vacuums) {
		const id = vacuum.item.skyblockId as (typeof vacuumIds)[number];
		const expected = vacuumStats[id];

		expect(vacuum.getStat(Stat.FarmingFortune)).toBe(expected.fortune);
		expect(vacuum.getStat(Stat.Damage)).toBe(expected.damage);
		expect(vacuum.getStat(Stat.FarmingWisdom)).toBe(0);
		expect(vacuum.getStat(Stat.WheatFortune)).toBe(0);
	}
});

test('vacuum reforges are vacuum-only and expose pest stats', () => {
	const beady = new Vacuum(
		vacuum('INFINI_VACUUM_HOOVERIUS', {
			attributes: { rarity: Rarity.Legendary, modifier: 'beady' },
		})
	);

	expect(beady.getStat(Stat.Damage)).toBe(275);
	expect(beady.getStat(Stat.Intelligence)).toBe(50);
	expect(beady.getStat(Stat.PestKillFortune)).toBe(100);
	expect(beady.getStat(Stat.FarmingFortune)).toBe(25);

	const buzzing = new Vacuum(
		vacuum('INFINI_VACUUM_HOOVERIUS', {
			attributes: { rarity: Rarity.Legendary, modifier: 'buzzing', bookworm_books: '2' },
		})
	);

	expect(buzzing.getStat(Stat.FarmingFortune)).toBe(34);
	expect(buzzing.getStat(Stat.Damage)).toBe(540);

	const cropTool = new FarmingTool({
		name: '§9Euclid Wheat Hoe',
		skyblockId: 'THEORETICAL_HOE_WHEAT_1',
		uuid: 'wheat',
		lore: [],
		attributes: { rarity: Rarity.Rare, modifier: 'beady' },
		enchantments: {},
	});
	expect(cropTool.reforge).toBeUndefined();
	expect(cropTool.reforgeStats).toBeUndefined();
});

test('Praying Mantis Shard scales vacuum damage by 10 percent per level', () => {
	const levelOne = new Vacuum(vacuum('INFINI_VACUUM_HOOVERIUS'), {
		attributes: { insect_power: 1 },
	});
	const maxed = new Vacuum(vacuum('INFINI_VACUUM_HOOVERIUS'), {
		attributes: { insect_power: 64 },
	});
	const buzzing = new Vacuum(
		vacuum('INFINI_VACUUM_HOOVERIUS', {
			attributes: { rarity: Rarity.Legendary, modifier: 'buzzing', bookworm_books: '2' },
		}),
		{ attributes: { insect_power: 64 } }
	);

	expect(levelOne.getInsectPowerDamageLevel()).toBe(1);
	expect(levelOne.getStat(Stat.Damage)).toBe(275);
	expect(maxed.getInsectPowerDamageLevel()).toBe(10);
	expect(maxed.getStat(Stat.Damage)).toBe(500);
	expect(buzzing.getStat(Stat.Damage)).toBe(1080);
});

test('Praying Mantis Shard appears in vacuum damage breakdown and progress', () => {
	const tool = new Vacuum(vacuum('INFINI_VACUUM_HOOVERIUS'), {
		attributes: { insect_power: 1 },
	});

	const breakdown = tool.getStatBreakdown(Stat.Damage);
	expect(breakdown['Praying Mantis Shard']).toMatchObject({
		value: 25,
		stat: Stat.Damage,
	});
	expect(Object.values(breakdown).reduce((sum, entry) => sum + entry.value, 0)).toBe(275);

	const progress = tool.getProgress([Stat.Damage]);
	const shardProgress = progress.find((entry) => entry.name === 'Praying Mantis Shard');
	expect(shardProgress?.stats?.[Stat.Damage]).toMatchObject({
		current: 25,
		max: 250,
		ratio: 0.1,
	});

	const upgrade = tool.getUpgrades({ stat: Stat.Damage }).find((entry) => entry.title === 'Praying Mantis 2');
	expect(upgrade?.stats?.[Stat.Damage]).toBe(25);
	expect(upgrade?.cost?.items?.SHARD_PRAYING_MANTIS).toBe(2);
	expect(upgrade?.meta).toMatchObject({
		type: 'attribute',
		key: 'insect_power',
		value: 3,
	});
});

test('vacuum reforge upgrades prefer Beady pest kill fortune over Buzzing farming fortune', () => {
	const tool = new Vacuum(vacuum('INFINI_VACUUM_HOOVERIUS'));
	const reforges = tool.getUpgrades({ stats: [Stat.PestKillFortune, Stat.Damage, Stat.FarmingFortune] });

	expect(reforges[0]?.title).toBe('Reforge to Beady');
	expect(reforges[0]?.stats?.[Stat.PestKillFortune]).toBe(100);
});

test('pest-focused Beady vacuum progress does not show or suggest normal fortune reforges', () => {
	const tool = new Vacuum(
		vacuum('INFINI_VACUUM_HOOVERIUS', {
			attributes: { rarity: Rarity.Legendary, modifier: 'beady' },
		})
	);

	const progress = tool.getProgress([Stat.PestKillFortune, Stat.Damage]);
	const reforgeProgress = progress.find((p) => p.name === 'Reforge Stats');
	const upgrades = tool.getUpgrades({ stats: [Stat.PestKillFortune, Stat.Damage] });

	expect(reforgeProgress?.stats?.[Stat.FarmingFortune]).toBeUndefined();
	expect(reforgeProgress?.stats?.[Stat.PestKillFortune]?.current).toBe(100);
	expect(upgrades.some((u) => u.title === 'Reforge to Buzzing')).toBe(false);
});

test('Bug Blender contributes pest kill fortune without inflating normal farming fortune', () => {
	const tool = new Vacuum(
		vacuum('INFINI_VACUUM_HOOVERIUS', {
			enchantments: { bug_blender: 3 },
		})
	);

	expect(tool.getStat(Stat.PestKillFortune)).toBe(60);
	expect(tool.getStat(Stat.FarmingFortune)).toBe(25);

	const upgrade = tool.getUpgrades({ stat: Stat.PestKillFortune }).find((u) => u.title === 'Bug Blender 4');
	expect(upgrade?.stats?.[Stat.PestKillFortune]).toBe(20);
});

test("Bookworm's Favorite Book is a repeatable vacuum damage upgrade", () => {
	const tool = new Vacuum(
		vacuum('INFINI_VACUUM_HOOVERIUS', {
			attributes: { rarity: Rarity.Legendary, bookworm_books: '2' },
		})
	);

	expect(tool.getStat(Stat.Damage)).toBe(270);

	const bookworm = tool.getUpgrades({ stat: Stat.Damage }).find((u) => u.title === "Bookworm's Favorite Book");
	expect(bookworm?.stats?.[Stat.Damage]).toBe(10);
	expect(bookworm?.repeatable).toBe(3);
	expect(bookworm?.meta?.id).toBe('bookworm_books');
});

test('vacuum Peridot slot costs only charge the locked Hooverius second slot unlock', () => {
	const infini = new Vacuum(vacuum('INFINI_VACUUM'));
	const infiniGem = infini.getUpgrades({ stat: Stat.FarmingFortune }).find((u) => u.meta?.slot === 'PERIDOT_0');

	expect(infiniGem?.cost?.coins ?? 0).toBe(0);
	expect(infiniGem?.cost?.items?.FINE_PERIDOT_GEM).toBe(1);

	const hooverius = new Vacuum(vacuum('INFINI_VACUUM_HOOVERIUS'));
	const hooveriusGems = hooverius
		.getUpgrades({ stat: Stat.FarmingFortune })
		.filter((u) => u.title === 'Fine Peridot Gemstone');
	const firstSlot = hooveriusGems.find((u) => u.meta?.slot === 'PERIDOT_0');
	const secondSlot = hooveriusGems.find((u) => u.meta?.slot === 'PERIDOT_1');

	expect(firstSlot?.cost?.coins ?? 0).toBe(0);
	expect(firstSlot?.cost?.items?.FINE_PERIDOT_GEM).toBe(1);
	expect(secondSlot?.cost?.coins).toBe(50_000);
	expect(secondSlot?.cost?.items?.FINE_PERIDOT_GEM).toBe(21);
});

test('vacuum tier upgrades preserve existing upgrade state when applied', () => {
	const current = new Vacuum(
		vacuum('SKYMART_VACUUM', {
			attributes: { rarity: Rarity.Common, bookworm_books: '2' },
			enchantments: { bug_blender: 2 },
		})
	);
	const tierUpgrade = current.getUpgrades({ stat: Stat.Damage }).find((u) => u.title === 'SkyMart Turbo Vacuum');

	expect(tierUpgrade).toBeDefined();
	current.applyUpgrade(tierUpgrade!);

	expect(current.item.skyblockId).toBe('SKYMART_TURBO_VACUUM');
	expect(current.item.attributes?.bookworm_books).toBe('2');
	expect(current.item.enchantments?.bug_blender).toBe(2);
	expect(current.getStat(Stat.Damage)).toBe(140);
	expect(current.getStat(Stat.PestKillFortune)).toBe(40);
});
