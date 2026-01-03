import { EnchantTierProcurement, FARMING_ENCHANTS, type FarmingEnchant } from '../constants/enchants.js';
import { Stat } from '../constants/stats.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../constants/upgrades.js';
import type { Upgradeable } from '../fortune/upgradeable.js';
import { getMaxStatFromEnchant, getStatFromEnchant } from '../util/enchants.js';

export function getUpgradeableEnchants(upgradeable: Upgradeable, stat: Stat = Stat.FarmingFortune): FortuneUpgrade[] {
	if (!upgradeable.type) return [];

	const result = [] as FortuneUpgrade[];

	for (const enchantId in FARMING_ENCHANTS) {
		result.push(...getUpgradeableEnchant(upgradeable, enchantId, stat));
	}

	return result;
}

export function getUpgradeableEnchant(
	upgradeable: Upgradeable,
	enchantId: string,
	stat: Stat = Stat.FarmingFortune,
	options?: { includeWhenNoStatImpact?: boolean }
): FortuneUpgrade[] {
	const enchant = FARMING_ENCHANTS[enchantId];
	if (!upgradeable.type || !enchant) return [];

	const result = [] as FortuneUpgrade[];

	// Skip if the enchantment doesn't apply to the item
	if (!enchant || !enchant.appliesTo.includes(upgradeable.type)) return result;
	// Skip if the enchantment is crop specific and the crop doesn't match
	if (enchant.cropSpecific && enchant.cropSpecific !== upgradeable.crop) return result;

	const applied = upgradeable.item.enchantments?.[enchantId];

	// If this enchant can never affect the selected stat, skip it entirely
	// unless explicitly requested (used for progress-only enchants).
	const maxForStat = getMaxStatFromEnchant(enchant, stat, upgradeable.options, upgradeable.crop);
	const includeWhenNoStatImpact = options?.includeWhenNoStatImpact === true;
	if (maxForStat <= 0 && !includeWhenNoStatImpact) return result;
	const currentForStat = applied
		? getStatFromEnchant(applied, enchant, stat, upgradeable.options, upgradeable.crop)
		: 0;
	if (maxForStat > 0 && maxForStat <= currentForStat && !includeWhenNoStatImpact) return result;

	// If the enchantment is not applied, add an entry for applying it
	if (!applied) {
		const procurement = enchant.levels[enchant.minLevel]?.procurement;
		const deltaStats: Partial<Record<Stat, number>> = {};
		for (const stat of Object.values(Stat)) {
			const val = getStatFromEnchant(enchant.minLevel, enchant, stat, upgradeable.options, upgradeable.crop);
			if (val !== 0) deltaStats[stat] = val;
		}
		// Some enchants (e.g. Dedication) are crop-computed and can evaluate to 0
		// without player context. Preserve stat keys so stat-filtered views include them.
		if (maxForStat > 0) {
			if (stat !== Stat.FarmingFortune && deltaStats[stat] === undefined) {
				deltaStats[stat] = 0;
			}
			if (deltaStats[Stat.FarmingFortune] === undefined) {
				deltaStats[Stat.FarmingFortune] = 0;
			}
		}
		const increase = deltaStats[Stat.FarmingFortune] ?? 0;

		result.push({
			title: enchant.name + ' 1',
			increase,
			stats: deltaStats,
			wiki: enchant.wiki,
			action:
				!procurement || procurement === EnchantTierProcurement.Normal
					? UpgradeAction.Apply
					: UpgradeAction.LevelUp,
			category: UpgradeCategory.Enchant,
			conflictKey: `enchant:${enchantId}:1`,
			cost: {
				items: {
					[enchantNameToId(enchant) + '_1']: 1,
				},
			},
			onto: {
				name: upgradeable.item.name,
				skyblockId: upgradeable.item.skyblockId,
			},
			meta: {
				type: 'enchant',
				key: enchantId,
				value: 1,
				itemUuid: upgradeable.item.uuid ?? undefined,
			},
		});

		return result;
	}

	// If the enchantment is at max level already, we don't need to do anything
	if (applied >= enchant.maxLevel) return result;

	// Add an entry for upgrading the enchantment
	const deltaStats: Partial<Record<Stat, number>> = {};
	for (const stat of Object.values(Stat)) {
		const before = getStatFromEnchant(applied, enchant, stat, upgradeable.options, upgradeable.crop);
		const after = getStatFromEnchant(applied + 1, enchant, stat, upgradeable.options, upgradeable.crop);
		const diff = after - before;
		if (diff !== 0) deltaStats[stat] = diff;
	}
	if (maxForStat > 0) {
		if (stat !== Stat.FarmingFortune && deltaStats[stat] === undefined) {
			deltaStats[stat] = 0;
		}
		if (deltaStats[Stat.FarmingFortune] === undefined) {
			deltaStats[Stat.FarmingFortune] = 0;
		}
	}
	const increase = deltaStats[Stat.FarmingFortune] ?? 0;

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
		increase,
		stats: deltaStats,
		action: normalNext ? UpgradeAction.Apply : UpgradeAction.LevelUp,
		category: UpgradeCategory.Enchant,
		conflictKey: `enchant:${enchantId}:${applied + 1}`,
		cost: cost,
		wiki: enchant.wiki,
		onto: {
			name: upgradeable.item.name,
			skyblockId: upgradeable.item.skyblockId,
		},
		meta: {
			type: 'enchant',
			key: enchantId,
			value: applied + 1,
			itemUuid: upgradeable.item.uuid ?? undefined,
		},
	});

	return result;
}

function enchantNameToId(enchant: FarmingEnchant): string {
	if (enchant.id) return enchant.id;
	return 'ENCHANTMENT_' + enchant.name.toLocaleUpperCase().replaceAll(' ', '_').replaceAll('-', '_');
}
