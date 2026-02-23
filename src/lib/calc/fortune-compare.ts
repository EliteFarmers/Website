import type { RatesItemPriceData } from '$lib/api/elite';
import type { FortuneSandboxSideData } from '$lib/schemas/tool-settings/fortune-sandbox';
import {
	Crop,
	FARMING_ARMOR_INFO,
	FARMING_ENCHANTS,
	FARMING_EQUIPMENT_INFO,
	FarmingTool,
	GearSlot,
	getPossibleResultsFromCrops,
	PET_LEVELS,
	PET_RARITY_OFFSETS,
	Rarity,
	type DetailedDropsResult,
} from 'farming-weight';

export type FortuneCompareSideKey = 'A' | 'B';
export type FortuneCompareFieldSection = 'pet' | 'tool' | 'armorEquipment' | 'stats';
export type FortuneCompareMetric = 'bazaarProfit' | 'npcProfit';
export type FortuneCompareDiffMode = 'summary' | 'sources' | 'break-even';

export interface FortuneCompareFieldRange {
	start: number;
	end: number;
	step: number;
}

export interface FortuneCompareFieldDefinition {
	id: string;
	label: string;
	section: FortuneCompareFieldSection;
	range: FortuneCompareFieldRange;
	getValue: (side: FortuneSandboxSideData) => number;
	setValue: (side: FortuneSandboxSideData, value: number) => void;
}

export interface FortuneBreakEvenScanInput {
	sideA: FortuneSandboxSideData;
	sideB: FortuneSandboxSideData;
	scanSide: FortuneCompareSideKey;
	field: FortuneCompareFieldDefinition;
	range: FortuneCompareFieldRange;
	metricResolver: (sideA: FortuneSandboxSideData, sideB: FortuneSandboxSideData) => { A: number; B: number };
}

export type FortuneBreakEvenScanResult =
	| {
			status: 'found';
			value: number;
			metrics: { A: number; B: number };
	  }
	| {
			status: 'not-found';
			lastMetrics: { A: number; B: number };
	  }
	| {
			status: 'invalid-range';
	  };

function normalizedRarity(tier: string | null | undefined): Rarity {
	const normalized = String(tier ?? 'LEGENDARY').toLowerCase();
	const values = new Set(Object.values(Rarity).map((value) => String(value).toLowerCase()));
	if (!values.has(normalized)) {
		return Rarity.Legendary;
	}
	return normalized as Rarity;
}

function getXpForLevel(level: number, rarity: Rarity): number {
	const clamped = Math.max(1, Math.floor(level));
	const offset = PET_RARITY_OFFSETS[rarity] ?? 0;
	let exp = 0;
	for (let i = offset; i < offset + clamped - 1; i++) {
		exp += PET_LEVELS[i] ?? 0;
	}
	return exp;
}

function getLevelFromXp(exp: number, rarity: Rarity): number {
	const offset = PET_RARITY_OFFSETS[rarity] ?? 0;
	let level = 1;
	let cumulative = 0;
	for (let i = offset; i < offset + 100 - 1; i++) {
		cumulative += PET_LEVELS[i] ?? 0;
		if (exp >= cumulative) {
			level += 1;
		} else {
			break;
		}
	}
	return Math.max(1, Math.min(100, level));
}

function ensureToolForCrop(side: FortuneSandboxSideData, crop: Crop) {
	side.toolsByCrop ??= {};
	const key = String(crop);
	if (side.toolsByCrop[key]) {
		return side.toolsByCrop[key]!;
	}
	const fallback = side.tool ?? {
		name: `Sandbox Tool (${key})`,
		skyblockId: 'THEORETICAL_HOE_WHEAT_3',
		uuid: `sandbox-tool-${key.toLowerCase()}`,
		lore: ['LEGENDARY'],
		attributes: {},
		enchantments: {},
	};
	side.toolsByCrop[key] = {
		...fallback,
		attributes: { ...(fallback.attributes ?? {}) },
		enchantments: { ...(fallback.enchantments ?? {}) },
		lore: [...(fallback.lore ?? [])],
	};
	return side.toolsByCrop[key]!;
}

function ensureArmorPiece(side: FortuneSandboxSideData, slot: GearSlot) {
	side.armor ??= [];
	const existing = side.armor.find((piece) => {
		const id = piece.skyblockId ?? '';
		return FARMING_ARMOR_INFO[id]?.slot === slot;
	});
	if (existing) {
		return existing;
	}
	const fallbackId =
		Object.entries(FARMING_ARMOR_INFO).find(([, info]) => info?.slot === slot)?.[0] ?? 'HELIANTHUS_HELMET';
	const fallbackInfo = FARMING_ARMOR_INFO[fallbackId];
	const fallback = {
		name: fallbackInfo?.name ?? fallbackId,
		skyblockId: fallbackId,
		uuid: `sandbox-armor-${slot}`,
		lore: [String(fallbackInfo?.maxRarity ?? Rarity.Legendary).toUpperCase()],
		attributes: {},
		enchantments: {},
	};
	side.armor.push(fallback);
	return fallback;
}

function ensureEquipmentPiece(side: FortuneSandboxSideData, slot: GearSlot) {
	side.equipment ??= [];
	const existing = side.equipment.find((piece) => {
		const id = piece.skyblockId ?? '';
		return FARMING_EQUIPMENT_INFO[id]?.slot === slot;
	});
	if (existing) {
		return existing;
	}
	const fallbackId =
		Object.entries(FARMING_EQUIPMENT_INFO).find(([, info]) => info?.slot === slot)?.[0] ?? 'BLOSSOM_NECKLACE';
	const fallbackInfo = FARMING_EQUIPMENT_INFO[fallbackId];
	const fallback = {
		name: fallbackInfo?.name ?? fallbackId,
		skyblockId: fallbackId,
		uuid: `sandbox-equipment-${slot}`,
		lore: [String(fallbackInfo?.maxRarity ?? Rarity.Legendary).toUpperCase()],
		attributes: {},
		enchantments: {},
	};
	side.equipment.push(fallback);
	return fallback;
}

function getOptionValue(
	side: FortuneSandboxSideData,
	key: keyof NonNullable<FortuneSandboxSideData['options']>,
	fallback = 0
): number {
	const source = side.options as Record<string, unknown>;
	const value = Number(source[key] ?? fallback);
	return Number.isFinite(value) ? value : fallback;
}

function setOptionValue(
	side: FortuneSandboxSideData,
	key: keyof NonNullable<FortuneSandboxSideData['options']>,
	value: number
) {
	side.options = {
		...(side.options ?? {}),
		[key]: value,
	};
}

function createOptionField(
	id: string,
	label: string,
	key: keyof NonNullable<FortuneSandboxSideData['options']>,
	range: FortuneCompareFieldRange
): FortuneCompareFieldDefinition {
	return {
		id,
		label,
		section: 'stats',
		range,
		getValue: (side) => getOptionValue(side, key, range.start),
		setValue: (side, value) => setOptionValue(side, key, value),
	};
}

function getToolEnchantIdsForCrop(side: FortuneSandboxSideData, crop: Crop) {
	const tool = ensureToolForCrop(side, crop);
	const farmingTool = new FarmingTool(tool as any, {} as any);
	const base = ['harvesting', 'dedication', 'sunder'];
	const turbo = Object.entries(FARMING_ENCHANTS)
		.filter(([id, enchant]) => id.startsWith('turbo_') && !!enchant.cropSpecific)
		.filter(([, enchant]) => farmingTool.crops.includes(enchant.cropSpecific!))
		.map(([id]) => id);
	return [...new Set([...base, ...turbo])];
}

export function getFortuneBreakEvenFields(side: FortuneSandboxSideData, crop: Crop): FortuneCompareFieldDefinition[] {
	const fields: FortuneCompareFieldDefinition[] = [];
	const cropName = String(crop);

	fields.push({
		id: 'pet.level',
		label: 'Pet Level',
		section: 'pet',
		range: { start: 1, end: 100, step: 1 },
		getValue: (target) => {
			const pet = target.pet;
			if (!pet) return 1;
			const rarity = normalizedRarity(pet.tier);
			return getLevelFromXp(Number(pet.exp ?? 0), rarity);
		},
		setValue: (target, value) => {
			target.pet ??= {
				type: 'ELEPHANT',
				tier: 'LEGENDARY',
				exp: 0,
			};
			const rarity = normalizedRarity(target.pet.tier);
			target.pet.exp = getXpForLevel(value, rarity);
		},
	});

	fields.push({
		id: `tool.level.${cropName}`,
		label: 'Tool Level',
		section: 'tool',
		range: { start: 1, end: 50, step: 1 },
		getValue: (target) => Number(ensureToolForCrop(target, crop).attributes?.levelable_lvl ?? 1),
		setValue: (target, value) => {
			const tool = ensureToolForCrop(target, crop);
			tool.attributes ??= {};
			tool.attributes.levelable_lvl = String(Math.max(1, Math.min(50, Math.floor(value))));
		},
	});

	fields.push({
		id: `tool.cultivating.${cropName}`,
		label: 'Cultivating Enchant',
		section: 'tool',
		range: { start: 0, end: 10, step: 1 },
		getValue: (target) => Number(ensureToolForCrop(target, crop).enchantments?.cultivating ?? 0),
		setValue: (target, value) => {
			const tool = ensureToolForCrop(target, crop);
			tool.enchantments ??= {};
			const clamped = Math.max(0, Math.min(10, Math.floor(value)));
			if (clamped > 0) {
				tool.enchantments.cultivating = clamped;
			} else {
				delete tool.enchantments.cultivating;
			}
		},
	});

	for (const enchantId of getToolEnchantIdsForCrop(side, crop)) {
		const enchant = FARMING_ENCHANTS[enchantId];
		if (!enchant) continue;
		const maxLevel = Math.max(1, enchant.maxLevel ?? 10);
		fields.push({
			id: `tool.enchant.${enchantId}.${cropName}`,
			label: `Tool Enchant: ${enchant.name}`,
			section: 'tool',
			range: { start: 0, end: maxLevel, step: 1 },
			getValue: (target) => Number(ensureToolForCrop(target, crop).enchantments?.[enchantId] ?? 0),
			setValue: (target, value) => {
				const tool = ensureToolForCrop(target, crop);
				tool.enchantments ??= {};
				const clamped = Math.max(0, Math.min(maxLevel, Math.floor(value)));
				if (clamped > 0) {
					tool.enchantments[enchantId] = clamped;
				} else {
					delete tool.enchantments[enchantId];
				}
			},
		});
	}

	fields.push(
		createOptionField('options.gardenLevel', 'Garden Level', 'gardenLevel', { start: 0, end: 15, step: 1 }),
		createOptionField('options.farmingLevel', 'Farming Level', 'farmingLevel', { start: 0, end: 60, step: 1 }),
		createOptionField('options.strength', 'Strength', 'strength', { start: 0, end: 500, step: 1 }),
		createOptionField('options.communityCenter', 'Community Center', 'communityCenter', {
			start: 0,
			end: 5,
			step: 1,
		}),
		createOptionField('options.filledRosewaterFlask', 'Filled Rosewater Flask', 'filledRosewaterFlask', {
			start: 0,
			end: 5,
			step: 1,
		}),
		createOptionField('options.anitaBonus', 'Anita Bonus', 'anitaBonus', { start: 0, end: 5, step: 1 }),
		createOptionField('options.plotsUnlocked', 'Plots Unlocked', 'plotsUnlocked', { start: 0, end: 24, step: 1 }),
		createOptionField('options.uniqueVisitors', 'Unique Visitors', 'uniqueVisitors', {
			start: 0,
			end: 80,
			step: 1,
		}),
		createOptionField('options.refinedTruffles', 'Refined Truffles', 'refinedTruffles', {
			start: 0,
			end: 10,
			step: 1,
		}),
		createOptionField('options.cocoaFortuneUpgrade', 'Cocoa Fortune Upgrade', 'cocoaFortuneUpgrade', {
			start: 0,
			end: 16,
			step: 1,
		}),
		createOptionField('options.dnaMilestone', 'DNA Milestone', 'dnaMilestone', { start: 0, end: 200, step: 1 }),
		createOptionField('options.infestedPlotProbability', 'Infested Plot Probability', 'infestedPlotProbability', {
			start: 0,
			end: 1,
			step: 0.01,
		})
	);

	fields.push({
		id: `options.milestones.${cropName}`,
		label: `${cropName} Milestone`,
		section: 'stats',
		range: { start: 0, end: 100, step: 1 },
		getValue: (target) => Number(target.options?.milestones?.[cropName] ?? 0),
		setValue: (target, value) => {
			target.options = {
				...(target.options ?? {}),
				milestones: {
					...(target.options?.milestones ?? {}),
					[cropName]: Math.max(0, Math.floor(value)),
				},
			};
		},
	});

	fields.push({
		id: `options.cropUpgrades.${cropName}`,
		label: `${cropName} Crop Upgrade`,
		section: 'stats',
		range: { start: 0, end: 100, step: 1 },
		getValue: (target) => Number(target.options?.cropUpgrades?.[cropName] ?? 0),
		setValue: (target, value) => {
			target.options = {
				...(target.options ?? {}),
				cropUpgrades: {
					...(target.options?.cropUpgrades ?? {}),
					[cropName]: Math.max(0, Math.floor(value)),
				},
			};
		},
	});

	const pesterminatorMax = Math.max(1, FARMING_ENCHANTS.pesterminator?.maxLevel ?? 5);
	const greenThumbMax = Math.max(1, FARMING_ENCHANTS.green_thumb?.maxLevel ?? 5);
	const armorSlots = [GearSlot.Helmet, GearSlot.Chestplate, GearSlot.Leggings, GearSlot.Boots];
	const equipmentSlots = [GearSlot.Necklace, GearSlot.Cloak, GearSlot.Belt, GearSlot.Gloves];

	for (const slot of armorSlots) {
		fields.push({
			id: `armor.pesterminator.${slot}`,
			label: `${slot.toUpperCase()} Pesterminator`,
			section: 'armorEquipment',
			range: { start: 0, end: pesterminatorMax, step: 1 },
			getValue: (target) => {
				const enchantments = ensureArmorPiece(target, slot).enchantments as
					| Record<string, number | null>
					| undefined;
				return Number(enchantments?.['pesterminator'] ?? 0);
			},
			setValue: (target, value) => {
				const piece = ensureArmorPiece(target, slot);
				const enchantments = (piece.enchantments ?? {}) as Record<string, number | null>;
				piece.enchantments = enchantments;
				const clamped = Math.max(0, Math.min(pesterminatorMax, Math.floor(value)));
				if (clamped > 0) {
					enchantments['pesterminator'] = clamped;
				} else {
					delete enchantments['pesterminator'];
				}
			},
		});
	}

	for (const slot of equipmentSlots) {
		const label = slot === GearSlot.Gloves ? 'BRACELET' : slot.toUpperCase();
		fields.push({
			id: `equipment.green_thumb.${slot}`,
			label: `${label} Green Thumb`,
			section: 'armorEquipment',
			range: { start: 0, end: greenThumbMax, step: 1 },
			getValue: (target) => {
				const enchantments = ensureEquipmentPiece(target, slot).enchantments as
					| Record<string, number | null>
					| undefined;
				return Number(enchantments?.['green_thumb'] ?? 0);
			},
			setValue: (target, value) => {
				const piece = ensureEquipmentPiece(target, slot);
				const enchantments = (piece.enchantments ?? {}) as Record<string, number | null>;
				piece.enchantments = enchantments;
				const clamped = Math.max(0, Math.min(greenThumbMax, Math.floor(value)));
				if (clamped > 0) {
					enchantments['green_thumb'] = clamped;
				} else {
					delete enchantments['green_thumb'];
				}
			},
		});
	}

	return fields;
}

function normalizedRange(range: FortuneCompareFieldRange) {
	const start = Number(range.start);
	const end = Number(range.end);
	const step = Math.abs(Number(range.step));
	if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step <= 0) {
		return null;
	}
	return { start, end, step };
}

function nextValue(current: number, direction: 1 | -1, step: number) {
	return direction === 1 ? current + step : current - step;
}

export function scanFortuneBreakEven(input: FortuneBreakEvenScanInput): FortuneBreakEvenScanResult {
	const range = normalizedRange(input.range);
	if (!range) {
		return { status: 'invalid-range' };
	}
	const direction: 1 | -1 = range.start <= range.end ? 1 : -1;
	let current = range.start;
	let lastMetrics = input.metricResolver(input.sideA, input.sideB);
	const epsilon = 1e-9;

	while (direction === 1 ? current <= range.end + epsilon : current >= range.end - epsilon) {
		const sideA = structuredClone(input.sideA);
		const sideB = structuredClone(input.sideB);
		if (input.scanSide === 'A') {
			input.field.setValue(sideA, current);
		} else {
			input.field.setValue(sideB, current);
		}
		const metrics = input.metricResolver(sideA, sideB);
		lastMetrics = metrics;
		if (input.scanSide === 'A') {
			if (metrics.A >= metrics.B) {
				return { status: 'found', value: current, metrics };
			}
		} else if (metrics.B >= metrics.A) {
			return { status: 'found', value: current, metrics };
		}
		current = nextValue(current, direction, range.step);
	}

	return { status: 'not-found', lastMetrics };
}

function getSellPrice(bzData: RatesItemPriceData[string]['bazaar'] | undefined, mode: 'insta' | 'order') {
	if (!bzData) return 0;
	return mode === 'insta' ? (bzData.averageSell ?? 0) : (bzData.averageSellOrder ?? 0);
}

export function calculateBestBazaarProfit(
	result: DetailedDropsResult | null | undefined,
	crop: Crop,
	bazaarData: RatesItemPriceData | undefined,
	bzMode: 'insta' | 'order'
): number | null {
	if (!result) {
		return null;
	}
	if (!bazaarData) {
		return null;
	}

	const amount = result.items[crop] ?? result.collection;
	const otherCoinsNpc = result.npcCoins - amount * result.npcPrice;
	const results = getPossibleResultsFromCrops(crop, amount);

	const otherItems = Object.entries(result.items ?? {}).filter(
		([itemId, count]) => itemId !== crop && itemId !== Crop.Seeds && (count ?? 0) > 0
	);
	const sellToBazaarDelta = otherItems
		.map(([itemId, items]) => {
			const bzData = bazaarData[itemId]?.bazaar;
			if (!bzData) return 0;
			const npc = bzData.npc ?? 0;
			const per = getSellPrice(bzData, bzMode);
			if (per <= npc || per <= 0) return 0;
			return items * (per - npc);
		})
		.reduce((sum, gain) => sum + gain, 0);
	const otherCoinsTotal = otherCoinsNpc + sellToBazaarDelta;

	const bestTotal = Object.entries(results)
		.map(([itemId, craft]) => {
			const bzData = bazaarData[itemId]?.bazaar;
			if (!bzData || itemId === crop) return null;
			const per = getSellPrice(bzData, bzMode);
			const profit = per * craft.fractionalItems - craft.fractionalCost;
			return profit + otherCoinsTotal;
		})
		.filter((value): value is number => value != null)
		.sort((a, b) => b - a)[0];

	return Math.floor(bestTotal ?? otherCoinsTotal);
}
