import { expect, test } from 'vitest';
import { Stat } from '../constants/stats.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FarmingTool } from '../fortune/farmingtool.js';
import type { EliteItemDto } from '../fortune/item.js';
import { FarmingPlayer } from './player.js';

const cactusKnife: EliteItemDto = {
	id: 291, // ID doesn't matter much for internal logic
	count: 1,
	skyblockId: 'CACTUS_KNIFE',
	uuid: 'test-knife-uuid',
	name: '§aCactus Knife',
	lore: [],
	enchantments: {},
	attributes: {},
};

import { Crop } from '../constants/crops.js';
import { Skill } from '../constants/skills.js';

test('Interactive Upgrade: Enchantments', () => {
	const player = new FarmingPlayer({
		tools: [new FarmingTool(JSON.parse(JSON.stringify(cactusKnife)))],
	});

	let upgrades = player.getCropUpgrades(Crop.Cactus);

	let enchantUpgrade = upgrades.find(
		(u) => u.meta?.type === 'enchant' && u.meta?.key === 'harvesting' && u.meta?.value === 1
	);

	if (!enchantUpgrade) {
		enchantUpgrade = upgrades.find(
			(u) => u.meta?.type === 'enchant' && u.meta?.key === 'dedication' && u.meta?.value === 1
		);
	}

	expect(enchantUpgrade).toBeDefined();

	const upgradeName = enchantUpgrade!.title;
	const upgradeKey = enchantUpgrade!.meta!.key!;

	player.applyUpgrade(enchantUpgrade!);

	const tool = player.tools.find((t) => t.item.uuid === 'test-knife-uuid');
	expect(tool?.item.enchantments?.[upgradeKey]).toBe(1);

	upgrades = player.getCropUpgrades(Crop.Cactus);
	const nextUpgrade = upgrades.find(
		(u) => u.meta?.type === 'enchant' && u.meta?.key === upgradeKey && u.meta?.value === 2
	);
	const prevUpgrade = upgrades.find((u) => u.title === upgradeName);

	expect(prevUpgrade).toBeUndefined();
	expect(nextUpgrade).toBeDefined();
});

test('Interactive Upgrade: Farming For Dummies', () => {
	const player = new FarmingPlayer({
		tools: [new FarmingTool(JSON.parse(JSON.stringify(cactusKnife)))],
	});

	let upgrades = player.getCropUpgrades(Crop.Cactus);
	let ffdUpgrade = upgrades.find((u) => u.title === 'Farming For Dummies');

	expect(ffdUpgrade).toBeDefined();
	expect(ffdUpgrade?.meta?.id).toBe('farming_for_dummies_count');
	expect(ffdUpgrade?.meta?.value).toBe(1);

	// Apply FFD
	player.applyUpgrade(ffdUpgrade!);

	// Verify state
	const tool = player.tools.find((t) => t.item.uuid === 'test-knife-uuid');
	expect(tool?.item.attributes?.['farming_for_dummies_count']).toBe('1');

	// Next Upgrade
	upgrades = player.getCropUpgrades(Crop.Cactus);
	ffdUpgrade = upgrades.find((u) => u.title === 'Farming For Dummies');
	expect(ffdUpgrade).toBeDefined();
	expect(ffdUpgrade?.meta?.value).toBe(2);
});

test('Interactive Upgrade: Reforge', () => {
	const player = new FarmingPlayer({
		tools: [new FarmingTool(JSON.parse(JSON.stringify(cactusKnife)))],
	});

	const upgrades = player.getCropUpgrades(Crop.Cactus);
	const bountifulUpgrade = upgrades.find((u) => u.meta?.type === 'reforge' && u.meta?.id === 'bountiful');

	expect(bountifulUpgrade).toBeDefined();

	if (bountifulUpgrade) {
		player.applyUpgrade(bountifulUpgrade);

		const tool = player.tools.find((t) => t.item.uuid === 'test-knife-uuid');
		expect(tool?.item.attributes?.modifier).toBe('bountiful');

		expect(tool?.reforge?.name).toBe('Bountiful');
	}
});

test('Interactive Upgrade: Chain Upgrades', () => {
	const player = new FarmingPlayer({
		farmingLevel: 50,
		tools: [new FarmingTool(JSON.parse(JSON.stringify(cactusKnife)))],
	});

	let upgrades = player.getUpgrades();
	let levelUpgrade = upgrades.find((u) => u.meta?.type === 'skill' && u.meta?.key === 'farmingLevel');

	expect(levelUpgrade).toBeDefined();
	expect(levelUpgrade?.meta?.value).toBe(51);

	// Apply Level Upgrade
	player.applyUpgrade(levelUpgrade!);
	expect(player.options.farmingLevel).toBe(51);

	// Check Next Level Upgrade
	upgrades = player.getUpgrades();
	levelUpgrade = upgrades.find((u) => u.meta?.type === 'skill' && u.meta?.key === 'farmingLevel');
	expect(levelUpgrade?.title).toContain('52');

	// Chain with Tool Upgrade
	const toolUpgrade = upgrades.find((u) => u.meta?.key === 'harvesting' && u.meta?.value === 1);

	if (toolUpgrade) {
		player.applyUpgrade(toolUpgrade);
		const tool = player.tools.find((t) => t.item.uuid === 'test-knife-uuid');
		expect(tool?.item.enchantments?.['harvesting']).toBe(1);
	}
});

test('Interactive Upgrade: Crop Upgrades and Others', () => {
	const player = new FarmingPlayer({
		cropUpgrades: { [Crop.Cactus]: 0 },
	});

	const upgrades = player.getCropUpgrades(Crop.Cactus);
	const cropUpgrade = upgrades.find((u) => u.meta?.type === 'crop_upgrade' && u.meta?.key === Crop.Cactus);

	expect(cropUpgrade).toBeDefined();
	expect(cropUpgrade?.meta?.value).toBe(1);

	if (cropUpgrade) {
		player.applyUpgrade(cropUpgrade);
		expect(player.options.cropUpgrades?.[Crop.Cactus]).toBe(1);
	}

	// Cocoa upgrade
	const cocoaPlayer = new FarmingPlayer({
		cocoaFortuneUpgrade: 0,
	});
	const cocoaUpgrades = cocoaPlayer.getCropUpgrades(Crop.CocoaBeans);
	const cocoaUpgrade = cocoaUpgrades.find((u) => u.meta?.type === 'setting' && u.meta?.key === 'cocoaFortuneUpgrade');

	expect(cocoaUpgrade).toBeDefined();

	if (cocoaUpgrade) {
		cocoaPlayer.applyUpgrade(cocoaUpgrade);
		expect(cocoaPlayer.options.cocoaFortuneUpgrade).toBe(1);
	}
});

test('Interactive Upgrade: Buy New Item', () => {
	// Test buying a Magic 8 Ball (General Upgrade)
	const player = new FarmingPlayer({
		accessories: [],
	});

	const upgrades = player.getUpgrades();
	const magic8BallUpgrade = upgrades.find((u) => u.meta?.type === 'buy_item' && u.meta?.id === 'MAGIC_8_BALL');

	expect(magic8BallUpgrade).toBeDefined();

	if (magic8BallUpgrade) {
		player.applyUpgrade(magic8BallUpgrade);
		// Verify item is added
		const magic8Ball = player.accessories.find((a) => a.info.skyblockId === 'MAGIC_8_BALL');
		expect(magic8Ball).toBeDefined();
	}
});

test('Interactive Upgrade: Tool Tier Upgrade', () => {
	// Test upgrading a tool to next tier (Wheat Hoe T1 -> T2)
	const wheatHoeT1: EliteItemDto = {
		id: 291,
		count: 1,
		skyblockId: 'THEORETICAL_HOE_WHEAT_1',
		uuid: 'upgrade-test-hoe-uuid',
		name: "§aEuclid's Wheat Hoe",
		lore: [],
		enchantments: { dedication: 4, harvesting: 6 },
		attributes: { modifier: 'blessed', farming_for_dummies_count: '3' },
		gems: { PERIDOT_0: 'FINE' },
	};

	const player = new FarmingPlayer({
		tools: [new FarmingTool(wheatHoeT1)],
		milestones: {
			[Crop.Wheat]: 30,
		},
	});

	// Get crop upgrades for Wheat
	const upgrades = player.getCropUpgrades(Crop.Wheat);

	// Find the tool tier upgrade (should suggest T2)
	const tierUpgrade = upgrades.find((u) => u.meta?.type === 'buy_item' && u.meta?.id === 'THEORETICAL_HOE_WHEAT_2');

	expect(tierUpgrade).toBeDefined();

	if (tierUpgrade && tierUpgrade.meta?.id) {
		const oldToolCount = player.tools.length;
		const oldTool = player.tools[0];

		player.applyUpgrade(tierUpgrade);

		// Verify the old tool was replaced, not duplicated
		expect(player.tools.length).toBe(oldToolCount);

		// Verify the new tool is the T2 version
		const newTool = player.tools.find((t) => t.info.skyblockId === 'THEORETICAL_HOE_WHEAT_2');
		expect(newTool).toBeDefined();

		// Verify enchantments, attributes, gems were transferred
		expect(newTool?.item.enchantments?.dedication).toBe(oldTool.item.enchantments?.dedication);
		expect(newTool?.item.enchantments?.harvesting).toBe(oldTool.item.enchantments?.harvesting);
		expect(newTool?.item.attributes?.modifier).toBe(oldTool.item.attributes?.modifier);
		expect(newTool?.item.attributes?.farming_for_dummies_count).toBe(
			oldTool.item.attributes?.farming_for_dummies_count
		);
		expect(newTool?.item.gems?.PERIDOT_0).toBe(oldTool.item.gems?.PERIDOT_0);
	}
});

test('Interactive Upgrade: Plot Unlock', () => {
	// Start with no plots unlocked
	const player = new FarmingPlayer({
		plots: [],
		plotsUnlocked: 0,
	});

	const upgrades = player.getUpgrades();
	const plotUpgrade = upgrades.find((u) => u.meta?.type === 'plot');

	expect(plotUpgrade).toBeDefined();
	expect(plotUpgrade?.meta?.id).toBeDefined(); // Plot name should be in id

	if (plotUpgrade) {
		const plotName = plotUpgrade.meta?.id;
		player.applyUpgrade(plotUpgrade);

		// Verify plotsUnlocked increased
		expect(player.options.plotsUnlocked).toBe(1);

		// Verify the plot was added to the plots array
		expect(player.options.plots).toContain(plotName);

		// Get upgrades again - should suggest a DIFFERENT plot
		const nextUpgrades = player.getUpgrades();
		const nextPlotUpgrade = nextUpgrades.find((u) => u.meta?.type === 'plot');

		if (nextPlotUpgrade) {
			// The next plot should have a different name
			expect(nextPlotUpgrade.meta?.id).not.toBe(plotName);
		}
	}
});

test('Interactive Upgrade: Expand Upgrade Tree', () => {
	const player = new FarmingPlayer({
		tools: [new FarmingTool(JSON.parse(JSON.stringify(cactusKnife)))],
	});

	// Get an enchant upgrade
	const upgrades = player.getCropUpgrades(Crop.Cactus);
	const enchantUpgrade = upgrades.find(
		(u) => u.meta?.type === 'enchant' && u.meta?.key === 'cultivating' && u.meta?.value === 1
	);

	if (!enchantUpgrade) {
		// Skip if no enchant upgrade available
		return;
	}

	// Expand the upgrade with stats tracking
	const tree = player.expandUpgrade(enchantUpgrade, {
		crop: Crop.Cactus,
		maxDepth: 3,
		stats: [Stat.FarmingFortune],
	});

	expect(tree).toBeDefined();
	expect(tree.upgrade).toBe(enchantUpgrade);
	expect(tree.statsGained[Stat.FarmingFortune] ?? 0).toBeGreaterThanOrEqual(0);

	if (tree.children.length > 0) {
		const firstChild = tree.children[0];
		expect(firstChild).toBeDefined();
		expect(firstChild?.upgrade.meta?.key).toBe('cultivating');
		expect(firstChild?.upgrade.meta?.value).toBe(2);
	}

	const originalTool = player.tools.find((t) => t.item.uuid === 'test-knife-uuid');
	expect(originalTool?.item.enchantments?.cultivating).toBeUndefined();
});

const squashHelmet: EliteItemDto = {
	id: 301,
	count: 1,
	skyblockId: 'SQUASH_HELMET',
	uuid: 'test-squash-helmet-uuid',
	name: '§aSquash Helmet',
	lore: [],
	enchantments: {},
	attributes: {},
};

test('Interactive Upgrade: Item Tier Upgrade Shows New Item Follow-ups', () => {
	const player = new FarmingPlayer({
		armor: [new FarmingArmor(JSON.parse(JSON.stringify(squashHelmet)))],
	});

	// Get the tier upgrade from SQUASH_HELMET to FERMENTO_HELMET
	const armorPiece = player.armor.find((a) => a.item.uuid === 'test-squash-helmet-uuid');
	expect(armorPiece).toBeDefined();

	const upgrades = armorPiece!.getUpgrades();
	const tierUpgrade = upgrades.find((u) => u.meta?.type === 'buy_item' && u.meta?.id === 'FERMENTO_HELMET');

	expect(tierUpgrade).toBeDefined();
	expect(tierUpgrade!.meta?.type).toBe('buy_item');
	expect(tierUpgrade!.meta?.id).toBe('FERMENTO_HELMET');

	// Expand the upgrade tree
	const tree = player.expandUpgrade(tierUpgrade!, {
		maxDepth: 2,
		stats: [Stat.FarmingFortune],
	});

	// Verify the tree structure
	expect(tree).toBeDefined();
	expect(tree.upgrade).toBe(tierUpgrade);

	expect(tree.statsGained[Stat.FarmingFortune]).toBeGreaterThan(0);
	expect(tree.children.length).toBeGreaterThan(0);

	const hasNewItemUpgrade = tree.children.some((child) => {
		const meta = child.upgrade.meta;
		return meta?.type === 'gem' || meta?.type === 'reforge' || meta?.type === 'enchant';
	});

	expect(hasNewItemUpgrade).toBe(true);

	// Verify the original player was NOT modified - should still have SQUASH_HELMET
	const originalArmor = player.armor.find((a) => a.item.uuid === 'test-squash-helmet-uuid');
	expect(originalArmor).toBeDefined();
	expect(originalArmor?.item.skyblockId).toBe('SQUASH_HELMET');
});

test('Interactive Upgrade: Equipment Purchase Shows Follow-up Upgrades', () => {
	// Create a player with no equipment to test purchasing from empty slot
	const player = new FarmingPlayer({});

	// Get the armor set progress to find equipment purchase upgrades
	const progress = player.armorSet.getProgress();
	const cloakProgress = progress.find((p) => p.name === 'Cloak');

	expect(cloakProgress).toBeDefined();
	expect(cloakProgress?.upgrades).toBeDefined();
	expect(cloakProgress!.upgrades!.length).toBeGreaterThan(0);

	// The upgrade should be a purchase upgrade with proper meta
	const purchaseUpgrade = cloakProgress!.upgrades![0];
	expect(purchaseUpgrade.meta).toBeDefined();
	expect(purchaseUpgrade.meta?.type).toBe('buy_item');
	expect(purchaseUpgrade.meta?.id).toBeDefined();

	// Expand the upgrade tree
	const tree = player.expandUpgrade(purchaseUpgrade, {
		maxDepth: 2,
		stats: [Stat.FarmingFortune],
	});

	// Verify the tree structure
	expect(tree).toBeDefined();
	expect(tree.upgrade).toBe(purchaseUpgrade);

	// The purchase upgrade should gain fortune (or 0 if equipment has no fortune)
	expect(tree.statsGained[Stat.FarmingFortune] ?? 0).toBeGreaterThanOrEqual(0);

	// After purchasing equipment, children should show follow-up upgrades
	// like enchants (green_thumb), reforges (rooted, squeaky), etc.
	expect(tree.children.length).toBeGreaterThan(0);

	// Verify at least one child is an enchant, reforge, or other item upgrade
	const hasFollowUp = tree.children.some((child) => {
		const meta = child.upgrade.meta;
		return meta?.type === 'enchant' || meta?.type === 'reforge' || meta?.type === 'buy_item';
	});

	expect(hasFollowUp).toBe(true);
});

test('Upgrade Tree: Conflict Keys Prevent Duplicate Upgrade Types in Children', () => {
	// Test that when a reforge is applied at the root, child item upgrades don't suggest more reforges
	const player = new FarmingPlayer({
		armor: [new FarmingArmor(JSON.parse(JSON.stringify(squashHelmet)))],
	});

	// Get a reforge upgrade for the helmet
	const armorPiece = player.armor.find((a) => a.item.uuid === 'test-squash-helmet-uuid');
	expect(armorPiece).toBeDefined();

	const upgrades = armorPiece!.getUpgrades();
	const reforgeUpgrade = upgrades.find((u) => u.meta?.type === 'reforge');

	if (!reforgeUpgrade) {
		return; // Skip if no reforge available
	}

	// Verify the reforge has a conflict key
	expect(reforgeUpgrade.conflictKey).toBe('reforge');

	// Expand the upgrade tree
	const tree = player.expandUpgrade(reforgeUpgrade, {
		maxDepth: 3,
		stats: [Stat.FarmingFortune],
	});

	// Helper to recursively find all upgrades in the tree
	function collectAllUpgrades(node: typeof tree, depth = 0): Array<{ upgrade: typeof node.upgrade; depth: number }> {
		const result = [{ upgrade: node.upgrade, depth }];
		for (const child of node.children) {
			result.push(...collectAllUpgrades(child, depth + 1));
		}
		return result;
	}

	const allUpgrades = collectAllUpgrades(tree);

	// There should only be ONE reforge upgrade in the entire tree (the root)
	const reforgeUpgrades = allUpgrades.filter((u) => u.upgrade.conflictKey === 'reforge');
	expect(reforgeUpgrades.length).toBe(1);
	expect(reforgeUpgrades[0].depth).toBe(0); // Should be at root only

	// If there are children (e.g., item tier upgrades), they should not contain reforge upgrades
	for (const child of tree.children) {
		expect(child.upgrade.conflictKey).not.toBe('reforge');
	}
});

test('Upgrade Tree: Armor Piece Purchase Shows Complete Follow-up Tree', () => {
	const player = new FarmingPlayer({});

	const progress = player.armorSet.getProgress();
	const helmetProgress = progress.find((p) => p.name === 'Helmet');

	expect(helmetProgress).toBeDefined();
	expect(helmetProgress?.upgrades).toBeDefined();
	expect(helmetProgress!.upgrades!.length).toBeGreaterThan(0);

	const purchaseUpgrade = helmetProgress!.upgrades![0];
	expect(purchaseUpgrade.meta).toBeDefined();
	expect(purchaseUpgrade.meta?.type).toBe('buy_item');
	expect(purchaseUpgrade.meta?.id).toBeDefined();

	expect(purchaseUpgrade.conflictKey).toBe('item_purchase:Helmet');

	const tree = player.expandUpgrade(purchaseUpgrade, {
		maxDepth: 2,
		stats: [Stat.FarmingFortune],
	});

	expect(tree).toBeDefined();
	expect(tree.upgrade).toBe(purchaseUpgrade);
	expect(tree.children.length).toBeGreaterThan(0);

	// Should have at least one of: enchant, reforge, gem, or item_tier (next tier)
	const hasExpectedType = tree.children.some((child) => {
		const type = child.upgrade.meta?.type;
		return type === 'enchant' || type === 'reforge' || type === 'gem' || type === 'buy_item';
	});

	expect(hasExpectedType).toBe(true);

	const hasItemTierChild = tree.children.some((c) => c.upgrade.conflictKey?.startsWith('item_tier:'));
	expect(hasItemTierChild).toBe(true);
});

test('Upgrade Tree: Tier Upgrades Show Skill Requirements', () => {
	const player = new FarmingPlayer({});

	const progress = player.armorSet.getProgress();
	const helmetProgress = progress.find((p) => p.name === 'Helmet');
	const purchaseUpgrade = helmetProgress!.upgrades!.find((u) => u.conflictKey === 'item_purchase:Helmet')!;

	expect(purchaseUpgrade).toBeDefined();
	expect(purchaseUpgrade?.title).toBe('Farm Armor Helmet');
	expect(purchaseUpgrade?.skillReq).toBeDefined();
	expect(purchaseUpgrade?.skillReq?.[Skill.Farming]).toBe(10);

	const tree = player.expandUpgrade(purchaseUpgrade, {
		maxDepth: 5,
		stats: [Stat.FarmingFortune],
	});

	const melonUpgrade = tree.children.find((c) => c.upgrade.meta?.id === 'MELON_HELMET');
	expect(melonUpgrade).toBeDefined();
	expect(melonUpgrade!.upgrade?.skillReq?.[Skill.Farming]).toBe(25);

	const cropieUpgrade = melonUpgrade?.children.find((c) => c.upgrade.meta?.id === 'CROPIE_HELMET');
	expect(cropieUpgrade).toBeDefined();

	expect(cropieUpgrade!.upgrade?.skillReq?.[Skill.Farming]).toBe(30);
});

test('Upgrade Tree: Recombobulate Only Appears Once Per Item Chain', () => {
	const player = new FarmingPlayer({
		armor: [new FarmingArmor(JSON.parse(JSON.stringify(squashHelmet)))],
	});

	const armorPiece = player.armor.find((a) => a.item.uuid === 'test-squash-helmet-uuid');
	expect(armorPiece).toBeDefined();

	const upgrades = armorPiece!.getUpgrades();
	const recombUpgrade = upgrades.find((u) => u.action === 'recombobulate');

	if (!recombUpgrade) {
		return;
	}

	expect(recombUpgrade.conflictKey).toBe('recombobulate');

	const tree = player.expandUpgrade(recombUpgrade, {
		maxDepth: 3,
		stats: [Stat.FarmingFortune],
	});

	function collectAllUpgrades(node: typeof tree, depth = 0): Array<{ upgrade: typeof node.upgrade; depth: number }> {
		const result = [{ upgrade: node.upgrade, depth }];
		for (const child of node.children) {
			result.push(...collectAllUpgrades(child, depth + 1));
		}
		return result;
	}

	const allUpgrades = collectAllUpgrades(tree);
	const recombUpgrades = allUpgrades.filter((u) => u.upgrade.conflictKey === 'recombobulate');

	expect(recombUpgrades.length).toBe(1);
	expect(recombUpgrades[0].depth).toBe(0);
});

test('Upgrade Tree: Tier Upgrade Shows All Available Upgrades For New Item', () => {
	const squashWithReforge: EliteItemDto = {
		id: 301,
		count: 1,
		skyblockId: 'SQUASH_HELMET',
		uuid: 'test-squash-reforge-uuid',
		name: '§aMossy Squash Helmet',
		lore: [],
		enchantments: {},
		attributes: { modifier: 'mossy' },
	};

	const player = new FarmingPlayer({
		armor: [new FarmingArmor(squashWithReforge)],
	});

	const armorPiece = player.armor.find((a) => a.item.uuid === 'test-squash-reforge-uuid');
	expect(armorPiece).toBeDefined();

	const upgrades = armorPiece!.getUpgrades();
	const tierUpgrade = upgrades.find((u) => u.meta?.type === 'buy_item' && u.meta?.id === 'FERMENTO_HELMET');

	if (!tierUpgrade) {
		return;
	}

	const tree = player.expandUpgrade(tierUpgrade, {
		maxDepth: 10,
		stats: [Stat.FarmingFortune],
	});

	expect(tree.children.length).toBe(2);

	const hasRecomb = tree.children.some((c) => c.upgrade.conflictKey === 'recombobulate');
	expect(hasRecomb).toBe(false);

	const hasPest1 = tree.children.some((c) => c.upgrade.conflictKey === 'enchant:pesterminator:1');
	expect(hasPest1).toBe(false);

	const hasUniqueGem = tree.children.some((c) => c.upgrade.conflictKey?.includes('PERIDOT_1'));
	expect(hasUniqueGem).toBe(true);
});

test('Interactive Upgrade: Lotus Necklace Green Thumb Chain', () => {
	const squeakyLotusNecklace: EliteItemDto = {
		id: 397,
		count: 1,
		skyblockId: 'LOTUS_NECKLACE',
		uuid: '1ab0455d-10a4-4a4e-b8b8-a4b76b720e02',
		name: '§9Squeaky Lotus Necklace',
		lore: [
			'§9§lRARE NECKLACE',
			'',
			'§2Pests §7by §a2.5%§7.',
			'§7Decreases the spawn cooldown of §2ൠ',
			'§9Squeaky Bonus',
			'',
			'§7Next Upgrade: §6+9☘ §8(§a194§7/§c250§8)',
			'§7Piece Bonus: §6+8☘',
			'',
			'§7gain §6☘ Farming Fortune§7.',
			'§7Complete §aGarden Visitor Offers §7to',
			'§6Piece Bonus: Salesperson',
			'',
			'§7Farming Fortune: §6+11 §9(+6)',
			'§7Bonus Pest Chance: §2+1% §9(+1%)',
			'§7Health: §c+10',
		],
		enchantments: null,
		attributes: {
			modifier: 'squeaky',
			timestamp: '1754452468250',
		},
	};

	const player = new FarmingPlayer({
		equipment: [new FarmingEquipment(JSON.parse(JSON.stringify(squeakyLotusNecklace)))],
	});

	// Verify initial state
	const necklace = player.equipment.find((e) => e.item.uuid === '1ab0455d-10a4-4a4e-b8b8-a4b76b720e02');
	expect(necklace).toBeDefined();

	const upgrades = necklace!.getUpgrades();
	const greenThumb1 = upgrades.find(
		(u) => u.meta?.type === 'enchant' && u.meta?.key === 'green_thumb' && u.meta?.value === 1
	);

	expect(greenThumb1).toBeDefined();

	if (!greenThumb1) return;
	const tree = player.expandUpgrade(greenThumb1, {
		maxDepth: 10,
		stats: [Stat.FarmingFortune],
	});

	expect(tree).toBeDefined();
	expect(tree.upgrade).toBe(greenThumb1);

	const findChild = (node: typeof tree, val: number) =>
		node.children.find((c) => c.upgrade.meta?.key === 'green_thumb' && c.upgrade.meta?.value === val);

	let currentVal = 2;
	let currentNode = tree;

	while (currentVal <= 5) {
		const nextNode = findChild(currentNode, currentVal);
		expect(nextNode).toBeDefined();
		if (!nextNode) break;

		// Verify increment
		expect(nextNode.upgrade.meta?.value).toBe(currentVal);

		currentNode = nextNode;
		currentVal++;
	}
});

import { ArmorSet } from '../fortune/farmingarmor.js';

test('Equipment in ArmorSet Preserved After Clone', () => {
	const lotusNecklace: EliteItemDto = {
		id: 397,
		count: 1,
		skyblockId: 'LOTUS_NECKLACE',
		uuid: 'armorset-test-uuid',
		name: '§9Lotus Necklace',
		lore: [],
		enchantments: {},
		attributes: { modifier: 'squeaky' },
	};

	const equipment = FarmingEquipment.fromArray([lotusNecklace]);
	const armorSet = new ArmorSet([], equipment);

	const player = new FarmingPlayer({
		armor: armorSet,
		uniqueVisitors: 37,
	});

	expect(player.equipment.length).toBe(1);
	expect(player.equipment[0]?.item.uuid).toBe('armorset-test-uuid');

	const cloned = player.clone();
	expect(cloned.equipment.length).toBe(1);
	expect(cloned.equipment[0]?.item.uuid).toBe('armorset-test-uuid');
});

test('Gem Upgrade Chain Preserves Slot ID', () => {
	const fermentoHelmet: EliteItemDto = {
		id: 301,
		count: 1,
		skyblockId: 'FERMENTO_HELMET',
		uuid: 'gem-chain-test-uuid',
		name: '§aFermento Helmet',
		lore: [],
		enchantments: {},
		attributes: { modifier: 'mossy' },
		gems: {},
	};

	const player = new FarmingPlayer({
		armor: [new FarmingArmor(fermentoHelmet)],
	});

	const armor = player.armor.find((a) => a.item.uuid === 'gem-chain-test-uuid');
	expect(armor).toBeDefined();

	const fineGem0 = armor!.getUpgrades().find((u) => u.meta?.type === 'gem' && u.meta?.slot === 'PERIDOT_0');
	expect(fineGem0).toBeDefined();

	const cloned = player.clone();
	cloned.applyUpgrade(fineGem0!);

	const clonedArmor = cloned.armor.find((a) => a.item.uuid === 'gem-chain-test-uuid');
	const flawlessGem0 = clonedArmor!
		.getUpgrades()
		.find((u) => u.meta?.type === 'gem' && u.meta?.slot === 'PERIDOT_0' && u.title?.includes('Flawless'));

	expect(flawlessGem0).toBeDefined();
	expect(flawlessGem0?.meta?.slot).toBe('PERIDOT_0');
});

test('Tier Upgrade Children Include Gem Upgrade Chain', () => {
	const squashHelmet: EliteItemDto = {
		id: 301,
		count: 1,
		skyblockId: 'SQUASH_HELMET',
		uuid: 'tier-gem-chain-uuid',
		name: '§aSquash Helmet',
		lore: [],
		enchantments: {},
		attributes: { modifier: 'mossy' },
		gems: {},
	};

	const player = new FarmingPlayer({
		armor: [new FarmingArmor(squashHelmet)],
	});

	const armor = player.armor.find((a) => a.item.uuid === 'tier-gem-chain-uuid');
	const tierUpgrade = armor!
		.getUpgrades()
		.find((u) => u.meta?.type === 'buy_item' && u.meta?.id === 'FERMENTO_HELMET');
	expect(tierUpgrade).toBeDefined();

	const tree = player.expandUpgrade(tierUpgrade!, {
		maxDepth: 5,
		stats: [Stat.FarmingFortune],
	});

	const gemChild = tree.children.find((c) => c.upgrade.conflictKey?.includes('PERIDOT_1'));
	expect(gemChild).toBeDefined();

	const flawlessChild = gemChild!.children.find((c) => c.upgrade.title?.includes('Flawless'));
	expect(flawlessChild).toBeDefined();

	const perfectChild = flawlessChild!.children.find((c) => c.upgrade.title?.includes('Perfect'));
	expect(perfectChild).toBeDefined();
});

test('Enchant Chain Works with Zero Fortune Increase', () => {
	const lotusNecklace: EliteItemDto = {
		id: 397,
		count: 1,
		skyblockId: 'LOTUS_NECKLACE',
		uuid: 'zero-fortune-test-uuid',
		name: '§9Lotus Necklace',
		lore: [],
		enchantments: {},
		attributes: { modifier: 'squeaky' },
	};

	const player = new FarmingPlayer({
		equipment: [new FarmingEquipment(lotusNecklace)],
	});

	const necklace = player.equipment.find((e) => e.item.uuid === 'zero-fortune-test-uuid');
	const greenThumb1 = necklace!
		.getUpgrades()
		.find((u) => u.meta?.type === 'enchant' && u.meta?.key === 'green_thumb' && u.meta?.value === 1);
	expect(greenThumb1).toBeDefined();
	expect(greenThumb1!.increase).toBe(0);

	const tree = player.expandUpgrade(greenThumb1!, {
		maxDepth: 5,
		stats: [Stat.FarmingFortune],
	});

	const greenThumb2Child = tree.children.find(
		(c) => c.upgrade.meta?.key === 'green_thumb' && c.upgrade.meta?.value === 2
	);
	expect(greenThumb2Child).toBeDefined();
});

test('Include All Tier Upgrade Children Option', () => {
	const squashHelmet: EliteItemDto = {
		id: 301,
		count: 1,
		skyblockId: 'SQUASH_HELMET',
		uuid: 'include-all-test-uuid',
		name: '§aSquash Helmet',
		lore: [],
		enchantments: {},
		attributes: { modifier: 'mossy' },
		gems: {},
	};

	const player = new FarmingPlayer({
		armor: [new FarmingArmor(squashHelmet)],
	});

	const armor = player.armor.find((a) => a.item.uuid === 'include-all-test-uuid');
	const tierUpgrade = armor!
		.getUpgrades()
		.find((u) => u.meta?.type === 'buy_item' && u.meta?.id === 'FERMENTO_HELMET');
	expect(tierUpgrade).toBeDefined();

	const treeFiltered = player.expandUpgrade(tierUpgrade!, {
		maxDepth: 2,
		stats: [Stat.FarmingFortune],
		includeAllTierUpgradeChildren: false,
	});

	const treeAll = player.expandUpgrade(tierUpgrade!, {
		maxDepth: 2,
		stats: [Stat.FarmingFortune],
		includeAllTierUpgradeChildren: true,
	});

	expect(treeAll.children.length).toBeGreaterThan(treeFiltered.children.length);

	const hasRecomb = treeAll.children.some((c) => c.upgrade.conflictKey === 'recombobulate');
	expect(hasRecomb).toBe(true);
});
