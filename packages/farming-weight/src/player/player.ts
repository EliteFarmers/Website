import { type GardenChipId, getChipLevel, getChipTempMultiplierPerLevel, normalizeChipId } from '../constants/chips.js';
import { type Crop, CROP_INFO } from '../constants/crops.js';
import { getContributoryStats, Stat, type StatBreakdown } from '../constants/stats.js';
import { TEMPORARY_FORTUNE, type TemporaryFarmingFortune } from '../constants/tempfortune.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory, type UpgradeTreeNode } from '../constants/upgrades.js';
import { FarmingAccessory } from '../fortune/farmingaccessory.js';
import { ArmorSet, FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FarmingPet } from '../fortune/farmingpet.js';
import { FarmingTool } from '../fortune/farmingtool.js';
import type { EliteItemDto } from '../fortune/item.js';
import { FarmingPets } from '../items/pets.js';
import { FARMING_TOOLS } from '../items/tools.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { getFakeItem } from '../upgrades/itemregistry.js';
import { CROP_FORTUNE_SOURCES } from '../upgrades/sources/cropsources.js';
import { GENERAL_FORTUNE_SOURCES } from '../upgrades/sources/generalsources.js';
import { filterAndSortUpgrades } from '../upgrades/upgradeutils.js';
import { calculateDetailedDrops } from '../util/ratecalc.js';
import { createFarmingWeightCalculator, type FarmingWeightInfo } from '../weight/weightcalc.js';
import type { PlayerOptions } from './playeroptions.js';

export function createFarmingPlayer(options: PlayerOptions) {
	return new FarmingPlayer(options);
}

export class FarmingPlayer {
	declare options: PlayerOptions;
	declare permFortune: number;
	declare tempFortune: number;
	get fortune() {
		return this.permFortune + this.tempFortune;
	}
	declare breakdown: StatBreakdown;
	declare tempFortuneBreakdown: StatBreakdown;

	declare tools: FarmingTool[];
	declare armor: FarmingArmor[];
	declare armorSet: ArmorSet;
	declare equipment: FarmingEquipment[];
	declare accessories: FarmingAccessory[];
	declare activeAccessories: FarmingAccessory[];
	declare pets: FarmingPet[];

	declare selectedTool?: FarmingTool;
	declare selectedPet?: FarmingPet;

	get attributes() {
		return this.options.attributes ?? {};
	}

	constructor(options: PlayerOptions) {
		this.setOptions(options);
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.activeAccessories = [];
		// Normalize chip IDs to support both full and short names
		if (this.options.chips) {
			const normalizedChips: Partial<Record<GardenChipId, number>> = {};
			for (const [key, value] of Object.entries(this.options.chips)) {
				const normalizedId = normalizeChipId(key);
				if (normalizedId) {
					normalizedChips[normalizedId] = value;
				}
			}
			this.options.chips = normalizedChips;
		}

		this.populatePets();
		this.populateTools();
		this.populateArmor();
		this.populateEquipment();
		this.populateActiveAccessories();

		this.permFortune = this.getGeneralFortune();
		this.tempFortune = this.getTempFortune();
	}

	populatePets() {
		this.options.pets ??= [];
		if (this.options.pets[0] instanceof FarmingPet) {
			this.pets = (this.options.pets as FarmingPet[]).sort((a, b) => b.fortune - a.fortune);
			for (const pet of this.pets) pet.setOptions(this.options);
		} else {
			this.pets = FarmingPet.fromArray(this.options.pets as EliteItemDto[], this.options);
		}

		this.selectedPet = this.options.selectedPet ?? this.pets.find((p) => p.pet.active) ?? this.pets[0];
	}

	populateTools() {
		this.options.tools ??= [];
		if (this.options.tools[0] instanceof FarmingTool) {
			this.tools = this.options.tools as FarmingTool[];
			for (const tool of this.tools) tool.setOptions(this.options);
			this.tools.sort((a, b) => b.fortune - a.fortune);
		} else {
			this.tools = FarmingTool.fromArray(this.options.tools as EliteItemDto[], this.options);
		}

		if (this.options.selectedTool) {
			const uuid = this.options.selectedTool.item.uuid;
			this.selectedTool = this.tools.find((t) => t.item.uuid === uuid) ?? this.tools[0];
		} else {
			this.selectedTool = this.tools[0];
		}
	}

	populateArmor() {
		this.options.armor ??= [];
		if (this.options.armor instanceof ArmorSet) {
			this.armorSet = this.options.armor;

			this.armor = this.armorSet.pieces;
			this.armor.sort((a, b) => b.potential - a.potential);

			this.equipment = this.armorSet.equipmentPieces;
			this.equipment.sort((a, b) => b.fortune - a.fortune);

			this.armorSet.setOptions(this.options);
		} else if (this.options.armor[0] instanceof FarmingArmor) {
			this.armor = (this.options.armor as FarmingArmor[]).sort((a, b) => b.potential - a.potential);
			for (const a of this.armor) a.setOptions(this.options);
			this.armorSet = new ArmorSet(this.armor);
		} else {
			this.armor = FarmingArmor.fromArray(this.options.armor as EliteItemDto[], this.options);
			this.armorSet = new ArmorSet(this.armor);
		}
	}

	populateEquipment() {
		this.options.equipment ??= [];

		// If equipment was already set by populateArmor (from ArmorSet), don't overwrite it
		if (this.equipment && this.equipment.length > 0) {
			// Load in equipment to armor set if it's empty
			if (this.armorSet.equipment.filter((e) => e).length === 0) {
				this.armorSet.setEquipment(this.equipment);
			}
			return;
		}

		if (this.options.equipment[0] instanceof FarmingEquipment) {
			this.equipment = (this.options.equipment as FarmingEquipment[]).sort((a, b) => b.fortune - a.fortune);
			for (const e of this.equipment) e.setOptions(this.options);
		} else {
			this.equipment = FarmingEquipment.fromArray(this.options.equipment as EliteItemDto[], this.options);
		}

		// Load in equipment to armor set if it's empty
		if (this.armorSet.equipment.filter((e) => e).length === 0) {
			this.armorSet.setEquipment(this.equipment);
		}
	}

	populateActiveAccessories() {
		this.options.accessories ??= [];
		this.activeAccessories = [];

		let pool: FarmingAccessory[] = [];
		if (this.options.accessories[0] instanceof FarmingAccessory) {
			pool = (this.options.accessories as FarmingAccessory[]).sort((a, b) => b.fortune - a.fortune);
		} else {
			pool = FarmingAccessory.fromArray(this.options.accessories as EliteItemDto[]);
		}

		// Filter by unique family (keep highest rarity/fortune)
		const familyMap = new Map<string, FarmingAccessory>();
		const others: FarmingAccessory[] = [];

		for (const acc of pool) {
			const family = acc.info.family;
			if (family) {
				const existing = familyMap.get(family);
				if (!existing || (acc.info.familyOrder ?? 0) > (existing.info.familyOrder ?? 0)) {
					familyMap.set(family, acc);
				}
			} else {
				others.push(acc);
			}
		}

		this.activeAccessories = [...familyMap.values(), ...others].sort((a, b) => b.fortune - a.fortune);
		this.accessories = pool;
	}

	changeArmor(armor: FarmingArmor[]) {
		this.armorSet = new ArmorSet(armor.sort((a, b) => b.fortune - a.fortune));
	}

	selectTool(tool: FarmingTool) {
		this.selectedTool = tool;
		this.permFortune = this.getGeneralFortune();
	}

	selectPet(pet: FarmingPet) {
		this.selectedPet = pet;
		this.permFortune = this.getGeneralFortune();
	}

	setStrength(strength: number) {
		this.options.strength = strength;
		for (const pet of this.pets) {
			pet.fortune = pet.getFortune();
		}
		this.permFortune = this.getGeneralFortune();
	}

	getProgress(stats?: Stat[]) {
		return getSourceProgress<FarmingPlayer>(this, GENERAL_FORTUNE_SOURCES, false, stats);
	}

	getUpgrades(options?: { stat?: Stat }) {
		const stats = options?.stat ? [options.stat] : undefined;
		const upgrades = getSourceProgress<FarmingPlayer>(this, GENERAL_FORTUNE_SOURCES, false, stats).flatMap(
			(source) => source.upgrades ?? []
		);

		const armorSetUpgrades = this.armorSet.getUpgrades(options);
		if (armorSetUpgrades.length > 0) {
			upgrades.push(...armorSetUpgrades);
		}
		return filterAndSortUpgrades(upgrades, options);
	}

	getCropUpgrades(crop?: Crop, tool?: FarmingTool) {
		const upgrades = [] as FortuneUpgrade[];
		if (!crop) return upgrades;

		const cropUpgrades = this.getCropProgress(crop);
		for (const source of cropUpgrades) {
			if (source.upgrades) {
				upgrades.push(...source.upgrades);
			}
		}

		const cropTool = tool ?? this.getSelectedCropTool(crop);
		if (cropTool) {
			const toolUpgrades = cropTool.getUpgrades();
			upgrades.push(...toolUpgrades);
		} else {
			const startingInfo = FARMING_TOOLS[CROP_INFO[crop].startingTool];
			if (startingInfo) {
				const fakeItem = getFakeItem(startingInfo.skyblockId, this.options);
				const purchaseId = fakeItem?.item.skyblockId ?? CROP_INFO[crop].startingTool;

				upgrades.push({
					title: startingInfo.name,
					action: UpgradeAction.Purchase,
					purchase: purchaseId,
					increase: fakeItem?.getFortune() ?? 0,
					wiki: startingInfo.wiki,
					max: fakeItem?.getProgress()?.reduce((acc, p) => acc + p.max, 0) ?? 0,
					category: UpgradeCategory.Item,
					cost: {
						items: {
							[purchaseId]: 1,
						},
					},
				});
			}
		}

		upgrades.sort((a, b) => b.increase - a.increase);
		return upgrades;
	}

	getGeneralFortune() {
		const breakdown = this.getStatBreakdown(Stat.FarmingFortune);
		this.breakdown = breakdown;
		return Object.values(breakdown).reduce((acc, val) => acc + val.value, 0);
	}

	getToolStat(tool: FarmingTool, stat: Stat, crop?: Crop): number {
		let val = 0;
		if (stat === Stat.FarmingFortune) {
			val += tool.getFortune();
		} else {
			val += tool.getStat(stat);
		}
		return val;
	}

	getStat(stat: Stat) {
		const breakdown = this.getStatBreakdown(stat);
		return Object.values(breakdown).reduce((acc, val) => acc + val.value, 0);
	}

	getStatBreakdown(stat: Stat, targetCrop?: Crop): StatBreakdown {
		const breakdown: StatBreakdown = {};

		const add = (name: string, value: number, stat: Stat) => {
			if (value > 0) {
				if (!breakdown[name]) {
					breakdown[name] = { value: 0, stat };
				}
				breakdown[name].value += value;
			}
		};

		// Identify all stats that contribute to the requested stat
		const contributingStats = getContributoryStats(stat);

		// General Sources
		// Always run general sources (they apply to everything)
		for (const source of GENERAL_FORTUNE_SOURCES) {
			// If this source is handled by an active accessory, skip it here to avoid double counting
			if (this.activeAccessories.some((a) => a.info.name === source.name)) continue;

			if (source.exists && !source.exists(this)) continue;

			for (const targetStat of contributingStats) {
				let val = 0;
				if (source.currentStat) {
					val = source.currentStat(this, targetStat) ?? 0;
				} else if (source.current && targetStat === Stat.FarmingFortune) {
					val = source.current(this) ?? 0;
				}
				add(source.name, val, targetStat);
			}
		}

		// Crop Sources
		// Only run if we have a target crop
		if (targetCrop) {
			for (const source of CROP_FORTUNE_SOURCES) {
				// Helianthus Relic Family is handled by activeAccessories
				if (source.name === 'Helianthus Relic Family') continue;

				const ctx = { player: this, crop: targetCrop };
				if (source.exists && !source.exists(ctx)) continue;

				for (const targetStat of contributingStats) {
					let val = 0;
					// For Crop Sources, strictly match the crop's fortune type.
					// Do not rely on 'statMatchesQuery' which might fuzzy match FarmingFortune.
					if (source.currentStat) {
						val = source.currentStat(ctx, targetStat) ?? 0;
					} else if (source.current && targetStat === CROP_INFO[targetCrop].fortuneType) {
						val = source.current(ctx) ?? 0;
					}
					add(source.name, val, targetStat);
				}
			}
		}

		// Pets
		const pet = this.selectedPet;
		if (pet) {
			for (const targetStat of contributingStats) {
				const val = pet.getFortune(targetStat);
				add(pet.info.name ?? 'Selected Pet', val, targetStat);
			}
		}

		// Tools
		if (!targetCrop && this.selectedTool) {
			for (const targetStat of contributingStats) {
				const val = this.selectedTool.getStat(targetStat);
				add(this.selectedTool.info.name, val, targetStat);
			}
		} else if (targetCrop) {
			// If targetCrop is defined, "Farming Tool" in CROP_FORTUNE_SOURCES handles it?
			// Use CROP_FORTUNE_SOURCES "Farming Tool" logic validation.
		}

		// Equipment
		for (const piece of this.armorSet.equipment) {
			if (!piece) continue;
			for (const targetStat of contributingStats) {
				const val = piece.getStat(targetStat);
				add(piece.info.name, val, targetStat);
			}
		}

		// Armor
		for (const piece of this.armorSet.armor) {
			if (!piece) continue;
			for (const targetStat of contributingStats) {
				const val = piece.getStat(targetStat);
				add(piece.info.name, val, targetStat);
			}
		}

		// Armor Set Bonuses
		for (const { bonus, count } of this.armorSet.setBonuses) {
			if (count < 2 || count > 4) continue;
			for (const targetStat of contributingStats) {
				const val = bonus.stats?.[count]?.[targetStat] ?? 0;
				add(bonus.name, val, targetStat);
			}
		}

		// Equipment Set Bonuses
		for (const { bonus, count } of this.armorSet.equipmentSetBonuses) {
			if (count < 2 || count > 4) continue;
			for (const targetStat of contributingStats) {
				const val = bonus.stats?.[count]?.[targetStat] ?? 0;
				add(bonus.name, val, targetStat); // Use info.name instead of item.name
			}
		}

		// Accessories
		for (const acc of this.activeAccessories) {
			// If the accessory is restricted to specific crops, check validity
			// If targetCrop is undefined (General mode), SKIP crop-specific accessories
			if (acc.info.crops && (!targetCrop || !acc.info.crops.includes(targetCrop))) continue;

			for (const targetStat of contributingStats) {
				const val = acc.getStat(targetStat);
				add(acc.info.name, val, targetStat); // Use info.name instead of item.name
			}
		}

		// Temporary Fortune
		if (this.tempFortuneBreakdown) {
			for (const [name, entry] of Object.entries(this.tempFortuneBreakdown)) {
				// Temporary fortune is always FarmingFortune
				if (contributingStats.includes(entry.stat)) {
					add(name, entry.value, entry.stat);
				}
			}
		}

		return breakdown;
	}

	getTempFortune() {
		let sum = 0;
		const breakdown: StatBreakdown = {};

		// Hypercharge multiplier scales by chip rarity tiers:
		// Rare (<=10): 1 + 0.03 * level
		// Epic (<=15): 1 + 0.03 * level
		// Legendary (>15): 2x boost to temporary fortune sources
		const hyperLevel = getChipLevel(this.options.chips?.HYPERCHARGE_GARDEN_CHIP) ?? 0;
		const perLevel = getChipTempMultiplierPerLevel('HYPERCHARGE_GARDEN_CHIP', hyperLevel) ?? 0;
		const hyperchargeMultiplier = 1 + perLevel * hyperLevel;

		if (!this.options.temporaryFortune) {
			this.tempFortuneBreakdown = breakdown;
			return sum;
		}

		for (const entry of Object.keys(this.options.temporaryFortune)) {
			const source = TEMPORARY_FORTUNE[entry as keyof TemporaryFarmingFortune];
			if (!source) continue;

			const fortune = source.fortune(this.options.temporaryFortune);
			if (fortune) {
				const boosted = fortune * hyperchargeMultiplier;
				breakdown[source.name] = { value: boosted, stat: Stat.FarmingFortune };
				sum += boosted;
			}
		}

		this.tempFortuneBreakdown = breakdown;
		// Merge temp breakdown into main breakdown
		if (this.breakdown) {
			Object.assign(this.breakdown, breakdown);
		} else {
			this.breakdown = breakdown;
		}

		return sum;
	}

	getCropFortune(crop?: Crop, tool = this.selectedTool): { fortune: number; breakdown: StatBreakdown } {
		// If no crop, we return general farming fortune
		const fortuneType = crop ? CROP_INFO[crop].fortuneType : Stat.FarmingFortune;
		const breakdown = this.getStatBreakdown(fortuneType, crop);
		const fortune = Object.values(breakdown).reduce((acc, val) => acc + val.value, 0);

		return {
			fortune,
			breakdown,
		};
	}

	getCropProgress(crop: Crop, stats?: Stat[]) {
		return getSourceProgress<{ crop: Crop; player: FarmingPlayer }>(
			{ crop, player: this },
			CROP_FORTUNE_SOURCES,
			false,
			stats
		);
	}

	getRates(crop: Crop, blocksBroken: number): ReturnType<typeof calculateDetailedDrops> {
		const tool = this.getBestTool(crop);
		const cropFortune = this.getCropFortune(crop, tool);
		const fortune = this.permFortune + this.tempFortune + cropFortune.fortune;

		return calculateDetailedDrops({
			crop: crop,
			blocksBroken: blocksBroken,
			farmingFortune: fortune,
			bountiful: tool?.bountiful ?? false,
			mooshroom: this.selectedPet?.type === FarmingPets.MooshroomCow,
		});
	}

	getWeightCalc(info?: FarmingWeightInfo): ReturnType<typeof createFarmingWeightCalculator> {
		return createFarmingWeightCalculator({
			collection: this.options.collection,
			pests: this.options.bestiaryKills,
			farmingXp: this.options.farmingXp,
			levelCapUpgrade: Math.min((this.options.farmingLevel ?? 0) - 50, 0),
			...info,
		});
	}

	getBestTool(crop: Crop) {
		return this.tools.find((t) => t.crops.includes(crop));
	}

	getSelectedCropTool(crop: Crop) {
		const matches = this.tools.filter((t) => t.crops.includes(crop));
		// If specific tool is selected, use it
		if (this.selectedTool && this.selectedTool.crops.includes(crop)) {
			return this.selectedTool;
		}
		// Otherwise return the best one (highest fortune? or first?)
		// Original getBestTool just returned find -> first match.
		// Sort by fortune?
		return matches.sort((a, b) => b.fortune - a.fortune)[0];
	}

	applyUpgrade(upgrade: FortuneUpgrade) {
		if (!upgrade.meta) return;
		const { type, itemUuid, key, value, id } = upgrade.meta;

		if (itemUuid) {
			const candidates = [...this.tools, ...this.armor, ...this.equipment, ...this.accessories];
			const target = candidates.find((i) => i.item.uuid === itemUuid);

			if (target) {
				if (type === 'enchant' && key) {
					target.item.enchantments ??= {};
					target.item.enchantments[key] = Number(value);
					// Re-instantiate to update enchantment-based logic
					if (target instanceof FarmingTool) {
						const idx = this.tools.indexOf(target);
						if (idx >= 0) {
							this.tools[idx] = new FarmingTool(target.item, this.options);
						}
					} else if (target instanceof FarmingArmor) {
						const idx = this.armor.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingArmor(target.item, this.options);
							this.armor[idx] = updatedPiece;
							this.armorSet.updateArmorSlot(updatedPiece);
						}
					} else if (target instanceof FarmingEquipment) {
						const idx = this.equipment.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingEquipment(target.item, this.options);
							this.equipment[idx] = updatedPiece;
							this.armorSet.updateEquipmentSlot(updatedPiece);
						}
					} else if (target instanceof FarmingAccessory) {
						const idx = this.accessories.indexOf(target);
						if (idx >= 0) {
							this.accessories[idx] = new FarmingAccessory(target.item, this.options);
						}
					}
				} else if (type === 'reforge' && id) {
					target.item.attributes ??= {};
					target.item.attributes.modifier = id;
					// Re-initialize to update logic
					if (target instanceof FarmingTool) {
						const idx = this.tools.indexOf(target);
						if (idx >= 0) {
							this.tools[idx] = new FarmingTool(target.item, this.options);
						}
					} else if (target instanceof FarmingArmor) {
						const idx = this.armor.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingArmor(target.item, this.options);
							this.armor[idx] = updatedPiece;
							this.armorSet.updateArmorSlot(updatedPiece);
						}
					} else if (target instanceof FarmingEquipment) {
						const idx = this.equipment.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingEquipment(target.item, this.options);
							this.equipment[idx] = updatedPiece;
							this.armorSet.updateEquipmentSlot(updatedPiece);
						}
					} else if (target instanceof FarmingAccessory) {
						const idx = this.accessories.indexOf(target);
						if (idx >= 0) {
							this.accessories[idx] = new FarmingAccessory(target.item, this.options);
						}
					}
				} else if (type === 'item' && id === 'farming_for_dummies_count') {
					target.item.attributes ??= {};
					target.item.attributes.farming_for_dummies_count = String(value);
					// Re-instantiate so getUpgrades reflects the updated FFD count
					if (target instanceof FarmingTool) {
						const idx = this.tools.indexOf(target);
						if (idx >= 0) {
							this.tools[idx] = new FarmingTool(target.item, this.options);
						}
					}
				} else if (type === 'gem' && upgrade.meta.slot && value) {
					target.item.gems ??= {};
					target.item.gems[upgrade.meta.slot] = String(value);
					// Re-instantiate so getUpgrades reflects the updated gem
					// Re-instantiate so getUpgrades reflects the updated gem
					if (target instanceof FarmingTool) {
						const idx = this.tools.indexOf(target);
						if (idx >= 0) {
							const newTool = new FarmingTool(target.item, this.options);
							this.tools[idx] = newTool;
							if (this.selectedTool === target) {
								this.selectedTool = newTool;
							}
						}
					} else if (target instanceof FarmingArmor) {
						const idx = this.armor.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingArmor(target.item, this.options);
							this.armor[idx] = updatedPiece;
							this.armorSet.updateArmorSlot(updatedPiece);
						}
					} else if (target instanceof FarmingEquipment) {
						const idx = this.equipment.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingEquipment(target.item, this.options);
							this.equipment[idx] = updatedPiece;
							this.armorSet.updateEquipmentSlot(updatedPiece);
						}
					} else if (target instanceof FarmingAccessory) {
						const idx = this.accessories.indexOf(target);
						if (idx >= 0) {
							this.accessories[idx] = new FarmingAccessory(target.item, this.options);
						}
					}
				} else if (type === 'item' && id === 'rarity_upgrades' && value) {
					target.item.attributes ??= {};
					target.item.attributes.rarity_upgrades = String(value);
					// Recomb affects rarity, which affects stats. Need to reload tool.
					if (target instanceof FarmingTool) {
						const idx = this.tools.indexOf(target);
						if (idx >= 0) {
							this.tools[idx] = new FarmingTool(target.item, this.options);
						}
					} else if (target instanceof FarmingArmor) {
						const idx = this.armor.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingArmor(target.item, this.options);
							this.armor[idx] = updatedPiece;
							this.armorSet.updateArmorSlot(updatedPiece);
						}
					} else if (target instanceof FarmingEquipment) {
						const idx = this.equipment.indexOf(target);
						if (idx >= 0) {
							const updatedPiece = new FarmingEquipment(target.item, this.options);
							this.equipment[idx] = updatedPiece;
							this.armorSet.updateEquipmentSlot(updatedPiece);
						}
					} else if (target instanceof FarmingAccessory) {
						const idx = this.accessories.indexOf(target);
						if (idx >= 0) {
							this.accessories[idx] = new FarmingAccessory(target.item, this.options);
						}
					}
				} else if (type === 'buy_item' && id) {
					// Tier upgrade: replace the old item with a new one
					const newItem = getFakeItem(id);
					if (newItem) {
						// Transfer enchantments, attributes, gems from old item
						newItem.item.enchantments = {
							...newItem.item.enchantments,
							...target.item.enchantments,
						};
						newItem.item.attributes = {
							...newItem.item.attributes,
							...target.item.attributes,
						};
						newItem.item.gems = {
							...newItem.item.gems,
							...target.item.gems,
						};
						// Preserve the old item's UUID so the item remains trackable
						newItem.item.uuid = target.item.uuid;

						if (target instanceof FarmingTool && newItem instanceof FarmingTool) {
							const idx = this.tools.indexOf(target);
							if (idx >= 0) {
								const newTool = new FarmingTool(newItem.item, this.options);
								this.tools[idx] = newTool;
								// console.log('DEBUG applyUpgrade check:', { target: target.item.skyblockId, selected: this.selectedTool?.item.skyblockId, equal: this.selectedTool === target });
								if (this.selectedTool === target) {
									this.selectedTool = newTool;
									// console.log('DEBUG applyUpgrade updated selectedTool to', newTool.item.skyblockId);
								}
							}
						} else if (target instanceof FarmingArmor && newItem instanceof FarmingArmor) {
							const idx = this.armor.indexOf(target);
							if (idx >= 0) {
								const updatedPiece = new FarmingArmor(newItem.item, this.options);
								this.armor[idx] = updatedPiece;
								this.armorSet.updateArmorSlot(updatedPiece);
							}
						} else if (target instanceof FarmingEquipment && newItem instanceof FarmingEquipment) {
							const idx = this.equipment.indexOf(target);
							if (idx >= 0) {
								const updatedPiece = new FarmingEquipment(newItem.item, this.options);
								this.equipment[idx] = updatedPiece;
								this.armorSet.updateEquipmentSlot(updatedPiece);
							}
						} else if (target instanceof FarmingAccessory && newItem instanceof FarmingAccessory) {
							const idx = this.accessories.indexOf(target);
							if (idx >= 0) {
								this.accessories[idx] = new FarmingAccessory(newItem.item, this.options);
							}
						}
						this.permFortune = this.getGeneralFortune();
					}
				}
			}
		} else if (type === 'skill') {
			if (key === 'farmingLevel' && value) {
				this.options.farmingLevel = Number(value);
			} else if (key === 'anitaBonus' && value) {
				this.options.anitaBonus = Number(value);
			} else if (key === 'communityCenter' && value) {
				this.options.communityCenter = Number(value);
			}
			this.permFortune = this.getGeneralFortune();
		} else if (type === 'plot' && (value || id)) {
			this.options.plotsUnlocked = Number(value);
			// Also add to plots array if using id (the plot name)
			if (id) {
				this.options.plots ??= [];
				if (!this.options.plots.includes(id)) {
					this.options.plots.push(id);
				}
			}
			this.permFortune = this.getGeneralFortune();
		} else if (type === 'attribute' && key && value) {
			this.options.attributes ??= {};
			this.options.attributes[key] = Number(value);
			this.permFortune = this.getGeneralFortune();
		} else if (type === 'chip' && id && value) {
			this.options.chips ??= {};
			// @ts-ignore - `id` is a GardenChipId string
			this.options.chips[id] = Number(value);
			this.permFortune = this.getGeneralFortune();
			this.tempFortune = this.getTempFortune();
		} else if (type === 'crop_upgrade' && key && value) {
			this.options.cropUpgrades ??= {};
			// @ts-ignore
			this.options.cropUpgrades[key] = Number(value);
			this.permFortune = this.getGeneralFortune();
		} else if (type === 'setting' && key && value) {
			if (key === 'cocoaFortuneUpgrade') {
				this.options.cocoaFortuneUpgrade = Number(value);
			}
			this.permFortune = this.getGeneralFortune();
		} else if (type === 'unlock' && id) {
			if (id === 'personal_best') {
				this.options.personalBestsUnlocked = true;
			}
			this.permFortune = this.getGeneralFortune();
		} else if (type === 'buy_item' && id) {
			const newItem = getFakeItem(id);
			if (newItem) {
				if (newItem instanceof FarmingTool) {
					const oldIdx = itemUuid ? this.tools.findIndex((t) => t.item.uuid === itemUuid) : -1;
					if (oldIdx >= 0) {
						const oldItem = this.tools[oldIdx]!;
						// Transfer enchantments, attributes, gems from old item
						newItem.item.enchantments = {
							...newItem.item.enchantments,
							...oldItem.item.enchantments,
						};
						newItem.item.attributes = {
							...newItem.item.attributes,
							...oldItem.item.attributes,
						};
						newItem.item.gems = { ...newItem.item.gems, ...oldItem.item.gems };
						// Re-instantiate to recalculate fortune with transferred properties
						this.tools[oldIdx] = new FarmingTool(newItem.item, this.options);
					} else {
						this.tools.push(newItem);
					}
				} else if (newItem instanceof FarmingArmor) {
					const oldIdx = itemUuid ? this.armor.findIndex((a) => a.item.uuid === itemUuid) : -1;
					if (oldIdx >= 0) {
						const oldItem = this.armor[oldIdx]!;
						newItem.item.enchantments = {
							...newItem.item.enchantments,
							...oldItem.item.enchantments,
						};
						newItem.item.attributes = {
							...newItem.item.attributes,
							...oldItem.item.attributes,
						};
						newItem.item.gems = { ...newItem.item.gems, ...oldItem.item.gems };
						this.armor[oldIdx] = new FarmingArmor(newItem.item, this.options);
					} else {
						this.armor.push(newItem);
					}
				} else if (newItem instanceof FarmingEquipment) {
					const oldIdx = itemUuid ? this.equipment.findIndex((e) => e.item.uuid === itemUuid) : -1;
					if (oldIdx >= 0) {
						const oldItem = this.equipment[oldIdx]!;
						newItem.item.enchantments = {
							...newItem.item.enchantments,
							...oldItem.item.enchantments,
						};
						newItem.item.attributes = {
							...newItem.item.attributes,
							...oldItem.item.attributes,
						};
						newItem.item.gems = { ...newItem.item.gems, ...oldItem.item.gems };
						this.equipment[oldIdx] = new FarmingEquipment(newItem.item, this.options);
					} else {
						this.equipment.push(newItem);
					}
				} else if (newItem instanceof FarmingAccessory) {
					const oldIdx = itemUuid ? this.accessories.findIndex((a) => a.item.uuid === itemUuid) : -1;
					if (oldIdx >= 0) {
						const oldItem = this.accessories[oldIdx]!;
						newItem.item.enchantments = {
							...newItem.item.enchantments,
							...oldItem.item.enchantments,
						};
						newItem.item.attributes = {
							...newItem.item.attributes,
							...oldItem.item.attributes,
						};
						newItem.item.gems = { ...newItem.item.gems, ...oldItem.item.gems };
						this.accessories[oldIdx] = new FarmingAccessory(newItem.item, this.options);
					} else {
						this.accessories.push(newItem);
					}
				}
				this.permFortune = this.getGeneralFortune();
			}
		}
	}

	/**
	 * Creates a deep clone of this FarmingPlayer that can be modified without affecting the original.
	 */
	clone(): FarmingPlayer {
		const cloneItems = <T extends { item: EliteItemDto }>(items: T[]): EliteItemDto[] => {
			return items.map((item) => ({
				...item.item,
				enchantments: { ...item.item.enchantments },
				attributes: { ...item.item.attributes },
				gems: { ...item.item.gems },
				lore: [...(item.item.lore ?? [])],
			}));
		};

		const clonedOptions: PlayerOptions = {
			...this.options,
			tools: cloneItems(this.tools),
			armor: cloneItems(this.armor),
			equipment: cloneItems(this.equipment),
			accessories: cloneItems(this.accessories),
			pets: this.pets.map((p) => ({ ...p.pet })),
			cropUpgrades: { ...this.options.cropUpgrades },
			milestones: { ...this.options.milestones },
			exportableCrops: { ...this.options.exportableCrops },
			personalBests: { ...this.options.personalBests },
			collection: { ...this.options.collection },
			bestiaryKills: { ...this.options.bestiaryKills },
			attributes: { ...this.options.attributes },
			plots: [...(this.options.plots ?? [])],
		};

		return new FarmingPlayer(clonedOptions);
	}

	/**
	 * Expands an upgrade into a tree of follow-up upgrades.
	 * This applies the upgrade on a cloned player and recursively finds upgrades
	 * for the same target item.
	 *
	 * @param upgrade - The upgrade to expand
	 * @param options.maxDepth - Maximum recursion depth (default: 10)
	 * @param options.crop - Crop for crop-specific fortune calculations
	 * @param options.stats - Stats to track (default: [Stat.FarmingFortune])
	 * @param options.includeAllTierUpgradeChildren - If true, first-level children of tier upgrades include ALL available upgrades for the new item (default: false)
	 */
	expandUpgrade(
		upgrade: FortuneUpgrade,
		options?: {
			maxDepth?: number;
			crop?: Crop;
			stats?: Stat[];
			includeAllTierUpgradeChildren?: boolean;
		}
	): UpgradeTreeNode {
		const {
			maxDepth = 10,
			crop,
			stats = [Stat.FarmingFortune],
			includeAllTierUpgradeChildren = false,
		} = options ?? {};
		const visited = new Set<string>();
		const usedConflictKeys = new Set<string>();

		return this.buildUpgradeTree(
			upgrade,
			0,
			maxDepth,
			crop,
			visited,
			usedConflictKeys,
			stats,
			includeAllTierUpgradeChildren
		);
	}

	private buildUpgradeTree(
		upgrade: FortuneUpgrade,
		depth: number,
		maxDepth: number,
		crop: Crop | undefined,
		visited: Set<string>,
		usedConflictKeys: Set<string>,
		stats: Stat[],
		includeAllTierUpgradeChildren: boolean
	): UpgradeTreeNode {
		// Create unique key for this upgrade to detect cycles
		const upgradeKey = this.getUpgradeKey(upgrade);
		if (visited.has(upgradeKey)) {
			// Return a leaf node if we've seen this exact upgrade before
			const currentStats = this.getAllStats(stats, crop);
			return {
				upgrade,
				statsBefore: currentStats,
				statsAfter: currentStats,
				statsGained: {},
				totalCost: upgrade.cost,
				children: [],
			};
		}
		visited.add(upgradeKey);

		// Clone player and apply upgrade
		const clonedPlayer = this.clone();
		const statsBefore = clonedPlayer.getAllStats(stats, crop);

		clonedPlayer.applyUpgrade(upgrade);

		const statsAfter = clonedPlayer.getAllStats(stats, crop);
		const statsGained = this.computeStatsDiff(statsBefore, statsAfter);

		const node: UpgradeTreeNode = {
			upgrade,
			statsBefore,
			statsAfter,
			statsGained,
			totalCost: upgrade.cost,
			children: [],
		};

		// Stop recursion at max depth
		if (depth >= maxDepth) {
			return node;
		}

		// Add current upgrade's conflict key for children to prevent duplicates in siblings
		const childConflictKeys = new Set(usedConflictKeys);
		if (upgrade.conflictKey) {
			childConflictKeys.add(upgrade.conflictKey);
		}

		// For buy_item (tier) upgrades, also add conflict keys from the original item's available upgrades.
		// This prevents duplicate suggestions - if Squash has Pesterminator 1 available,
		// Fermento's children shouldn't also suggest Pesterminator 1 (do it on Squash instead, it carries over).
		// When includeAllTierUpgradeChildren is true and depth is 0, skip this filtering to show ALL upgrades.
		const skipTierFiltering = includeAllTierUpgradeChildren && depth === 0;
		if (!skipTierFiltering && upgrade.meta?.type === 'buy_item' && upgrade.meta?.itemUuid) {
			const originalItem =
				this.tools.find((t) => t.item.uuid === upgrade.meta?.itemUuid) ??
				this.armor.find((a) => a.item.uuid === upgrade.meta?.itemUuid) ??
				this.equipment.find((e) => e.item.uuid === upgrade.meta?.itemUuid) ??
				this.accessories.find((a) => a.item.uuid === upgrade.meta?.itemUuid);

			if (originalItem && 'getUpgrades' in originalItem && typeof originalItem.getUpgrades === 'function') {
				for (const originalUpgrade of originalItem.getUpgrades() as FortuneUpgrade[]) {
					if (originalUpgrade.conflictKey) {
						childConflictKeys.add(originalUpgrade.conflictKey);
					}
				}
			}
		}

		// Find follow-up upgrades for the same target, excluding those with already-used conflict keys
		const primaryStat = stats[0] ?? Stat.FarmingFortune;
		const followUpUpgrades = this.getFollowUpUpgrades(clonedPlayer, upgrade, crop, primaryStat).filter(
			(u) => !u.conflictKey || !childConflictKeys.has(u.conflictKey)
		);

		// Build children (using the cloned player's state)
		for (const followUp of followUpUpgrades) {
			const childNode = clonedPlayer.buildUpgradeTree(
				followUp,
				depth + 1,
				maxDepth,
				crop,
				new Set(visited),
				childConflictKeys,
				stats,
				includeAllTierUpgradeChildren
			);
			node.children.push(childNode);
		}

		// Sort children by primary stat gained (highest first)
		node.children.sort((a, b) => {
			const aGain = a.statsGained[primaryStat] ?? 0;
			const bGain = b.statsGained[primaryStat] ?? 0;
			return bGain - aGain;
		});

		return node;
	}

	private getAllStats(stats: Stat[], crop?: Crop): Partial<Record<Stat, number>> {
		const result: Partial<Record<Stat, number>> = {};
		for (const stat of stats) {
			let value = this.getStat(stat);

			// Add crop-specific fortune if applicable
			if (crop && stat === Stat.FarmingFortune) {
				value += this.getCropFortune(crop).fortune;
			}

			if (value !== 0) {
				result[stat] = value;
			}
		}
		return result;
	}

	private computeStatsDiff(
		before: Partial<Record<Stat, number>>,
		after: Partial<Record<Stat, number>>
	): Partial<Record<Stat, number>> {
		const result: Partial<Record<Stat, number>> = {};
		const allStats = new Set([...Object.keys(before), ...Object.keys(after)]) as Set<Stat>;

		for (const stat of allStats) {
			const beforeVal = before[stat] ?? 0;
			const afterVal = after[stat] ?? 0;
			const diff = afterVal - beforeVal;
			if (diff !== 0) {
				result[stat] = diff;
			}
		}
		return result;
	}

	private getUpgradeKey(upgrade: FortuneUpgrade): string {
		const meta = upgrade.meta;
		if (!meta) return `${upgrade.title}`;

		const parts = [meta.type ?? '', meta.id ?? '', meta.itemUuid ?? '', meta.key ?? '', String(meta.value ?? '')];
		return parts.join(':');
	}

	private getFollowUpUpgrades(
		player: FarmingPlayer,
		appliedUpgrade: FortuneUpgrade,
		crop: Crop | undefined,
		primaryStat: Stat
	): FortuneUpgrade[] {
		const meta = appliedUpgrade.meta;
		if (!meta) return [];

		const itemUuid = meta.itemUuid;
		const upgrades: FortuneUpgrade[] = [];

		// Handle buy_item specially - these are item tier upgrades
		// After applying, we want ALL upgrades for the new item, not filtered by type
		// The new item preserves the old UUID, but we search by skyblockId to find the upgraded tier
		if (meta.type === 'buy_item' && meta.id) {
			const newItemId = meta.id;
			const target =
				player.tools.find((t) => t.item.skyblockId === newItemId) ??
				player.armor.find((a) => a.item.skyblockId === newItemId) ??
				player.equipment.find((e) => e.item.skyblockId === newItemId) ??
				player.accessories.find((a) => a.item.skyblockId === newItemId);

			if (target && 'getUpgrades' in target && typeof target.getUpgrades === 'function') {
				upgrades.push(...(target.getUpgrades({ stat: primaryStat }) as FortuneUpgrade[]));
			}
		} else if (itemUuid) {
			// Item-specific upgrade - find upgrades for the same item
			const target =
				player.tools.find((t) => t.item.uuid === itemUuid) ??
				player.armor.find((a) => a.item.uuid === itemUuid) ??
				player.equipment.find((e) => e.item.uuid === itemUuid) ??
				player.accessories.find((a) => a.item.uuid === itemUuid);

			if (target && 'getUpgrades' in target && typeof target.getUpgrades === 'function') {
				const itemUpgrades = target.getUpgrades({ stat: primaryStat }) as FortuneUpgrade[];
				// Filter to only include upgrades of the same type (enchant chains, tier upgrades, etc.)
				// For gem upgrades, also match on slot to only show follow-ups for that specific slot
				for (const u of itemUpgrades) {
					if (u.meta?.type === meta.type && u.meta?.key === meta.key) {
						// For gem upgrades, also require matching slot
						if (meta.type === 'gem' && meta.slot && u.meta?.slot !== meta.slot) {
							continue;
						}
						upgrades.push(u);
					}
				}
			}
		} else if (meta.type === 'skill' || meta.type === 'plot' || meta.type === 'attribute') {
			// General upgrades - find the next level of the same upgrade type
			const generalUpgrades = player.getUpgrades({ stat: primaryStat });
			for (const u of generalUpgrades) {
				if (u.meta?.type === meta.type && u.meta?.key === meta.key) {
					upgrades.push(u);
				}
			}
		} else if (meta.type === 'crop_upgrade' && crop) {
			// Crop-specific upgrades
			const cropUpgrades = player.getCropUpgrades(crop);
			for (const u of cropUpgrades) {
				if (u.meta?.type === meta.type && u.meta?.key === meta.key) {
					upgrades.push(u);
				}
			}
		}

		return upgrades;
	}
}

export interface JacobFarmingContest {
	crop: Crop;
	timestamp: number;
	collected: number;
	position?: number;
	participants?: number;
	medal?: number;
}
