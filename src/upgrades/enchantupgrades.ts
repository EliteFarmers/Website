import { EnchantTierProcurement, FARMING_ENCHANTS, type FarmingEnchant } from '../constants/enchants.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../constants/upgrades.js';
import type { Upgradeable } from '../fortune/upgradeable.js';
import { getFortuneFromEnchant } from '../util/enchants.js';

export function getUpgradeableEnchants(upgradeable: Upgradeable): FortuneUpgrade[] {
	if (!upgradeable.type) return [];

	const result = [] as FortuneUpgrade[];

	for (const enchantId in FARMING_ENCHANTS) {
		result.push(...getUpgradeableEnchant(upgradeable, enchantId));
	}

	return result;
}

export function getUpgradeableEnchant(upgradeable: Upgradeable, enchantId: string): FortuneUpgrade[] {
	const enchant = FARMING_ENCHANTS[enchantId];
	if (!upgradeable.type || !enchant) return [];

	const result = [] as FortuneUpgrade[];

	// Skip if the enchantment doesn't apply to the item
	if (!enchant || !enchant.appliesTo.includes(upgradeable.type)) return result;
	// Skip if the enchantment is crop specific and the crop doesn't match
	if (enchant.cropSpecific && enchant.cropSpecific !== upgradeable.crop) return result;

	const applied = upgradeable.item.enchantments?.[enchantId];

	// If the enchantment is not applied, add an entry for applying it
	if (!applied) {
		const procurement = enchant.levels[enchant.minLevel]?.procurement;

		result.push({
			title: enchant.name + ' 1',
			increase: getFortuneFromEnchant(enchant.minLevel, enchant, upgradeable.options, upgradeable.crop),
			wiki: enchant.wiki,
			action:
				!procurement || procurement === EnchantTierProcurement.Normal
					? UpgradeAction.Apply
					: UpgradeAction.LevelUp,
			category: UpgradeCategory.Enchant,
			cost: {
				items: {
					[enchantNameToId(enchant) + '_1']: 1,
				},
			},
			onto: {
				name: upgradeable.item.name,
				skyblockId: upgradeable.item.skyblockId,
			},
		});

		return result;
	}

	// If the enchantment is at max level already, we don't need to do anything
	if (applied >= enchant.maxLevel) return result;

	// Add an entry for upgrading the enchantment
	const currentFortune = getFortuneFromEnchant(applied, enchant, upgradeable.options, upgradeable.crop);
	const nextFortune = getFortuneFromEnchant(applied + 1, enchant, upgradeable.options, upgradeable.crop);

	const nextEnchant = enchant.levels[applied + 1];
	if (!nextEnchant) return result;

	const normalNext =
		!nextEnchant.procurement ||
		nextEnchant.procurement === EnchantTierProcurement.Normal ||
		nextEnchant.procurement === EnchantTierProcurement.Loot;
	const items = nextEnchant.cost?.items ?? ({} as Record<string, number>);

	switch (nextEnchant.procurement) {
		case undefined:
		case EnchantTierProcurement.Normal: {
			// Get amount of level 1 enchantment items needed to craft the same applied level
			// Ex: 4 level 1 items = 2 level 2 items = 1 level 3 item
			// Count = Math.pow(2, applied - 1)
			const count = Math.pow(2, applied - 1);
			items[enchantNameToId(enchant) + '_1'] = count;
			break;
		}
		case EnchantTierProcurement.Loot:
			// The desired level needs to be applied directly
			items[enchantNameToId(enchant) + '_' + (applied + 1)] = 1;
			break;
		case EnchantTierProcurement.SelfLeveling:
			return result; // Self-leveling enchantments do not have a cost
		default:
			break;
	}

	const cost = {
		...(nextEnchant.cost ?? {}),
		items: Object.keys(items).length > 0 ? items : undefined,
	};

	result.push({
		title: enchant.name + ' ' + (applied + 1),
		increase: nextFortune - currentFortune,
		action: normalNext ? UpgradeAction.Apply : UpgradeAction.LevelUp,
		category: UpgradeCategory.Enchant,
		cost: cost,
		wiki: enchant.wiki,
		onto: {
			name: upgradeable.item.name,
			skyblockId: upgradeable.item.skyblockId,
		},
	});

	return result;
}
function enchantNameToId(enchant: FarmingEnchant): string {
	if (enchant.id) return enchant.id;
	return 'ENCHANTMENT_' + enchant.name.toLocaleUpperCase().replaceAll(' ', '_').replaceAll('-', '_');
}
