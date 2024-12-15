import { Crop, EXPORTABLE_CROP_FORTUNE } from '../constants/crops.js';
import { fortuneFromPersonalBestContest } from '../constants/personalbests.js';
import {
	ANITA_FORTUNE_UPGRADE,
	COCOA_FORTUNE_UPGRADE,
	COMMUNITY_CENTER_UPGRADE,
	FARMING_LEVEL,
	GARDEN_CROP_UPGRADES,
	UNLOCKED_PLOTS,
} from '../constants/specific.js';
import { TEMPORARY_FORTUNE, TemporaryFarmingFortune } from '../constants/tempfortune.js';
import { FarmingAccessory } from '../fortune/farmingaccessory.js';
import { ArmorSet, FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FarmingPet } from '../fortune/farmingpet.js';
import { FarmingTool } from '../fortune/farmingtool.js';
import { EliteItemDto } from '../fortune/item.js';
import { CROP_FORTUNE_SOURCES } from '../upgrades/sources/cropsources.js';
import { GENERAL_FORTUNE_SOURCES } from '../upgrades/sources/generalsources.js';
import { getFortune, getSourceProgress } from '../upgrades/upgrades.js';
import { getCropDisplayName, getItemIdFromCrop } from '../util/names.js';
import { fortuneFromPestBestiary } from '../util/pests.js';
import { FarmingWeightInfo, createFarmingWeightCalculator } from '../weight/weightcalc.js';
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
	declare breakdown: Record<string, number>;
	declare tempFortuneBreakdown: Record<string, number>;

	declare tools: FarmingTool[];
	declare armor: FarmingArmor[];
	declare armorSet: ArmorSet;
	declare equipment: FarmingEquipment[];
	declare accessories: FarmingAccessory[];
	declare activeAccessories: FarmingAccessory[];
	declare pets: FarmingPet[];

	declare selectedTool?: FarmingTool;
	declare selectedPet?: FarmingPet;

	constructor(options: PlayerOptions) {
		this.options = options;

		options.pets ??= [];
		if (options.pets[0] instanceof FarmingPet) {
			this.pets = (options.pets as FarmingPet[]).sort((a, b) => b.fortune - a.fortune);
			for (const pet of this.pets) pet.setOptions(options);
		} else {
			this.pets = FarmingPet.fromArray(options.pets as EliteItemDto[], options);
		}

		this.selectedPet = this.options.selectedPet;

		options.tools ??= [];
		if (options.tools[0] instanceof FarmingTool) {
			this.tools = options.tools as FarmingTool[];
			for (const tool of this.tools) tool.setOptions(options);
			this.tools.sort((a, b) => b.fortune - a.fortune);
		} else {
			this.tools = FarmingTool.fromArray(options.tools as EliteItemDto[], options);
		}

		this.selectedTool = this.options.selectedTool ?? this.tools[0];

		options.armor ??= [];
		if (options.armor instanceof ArmorSet) {
			this.armorSet = options.armor;

			this.armor = this.armorSet.pieces;
			this.armor.sort((a, b) => b.fortune - a.fortune);

			this.equipment = this.armorSet.equipmentPieces;
			this.equipment.sort((a, b) => b.fortune - a.fortune);

			this.armorSet.setOptions(options);
		} else if (options.armor[0] instanceof FarmingArmor) {
			this.armor = (options.armor as FarmingArmor[]).sort((a, b) => b.potential - a.potential);
			for (const a of this.armor) a.setOptions(options);
			this.armorSet = new ArmorSet(this.armor);
		} else {
			this.armor = FarmingArmor.fromArray(options.armor as EliteItemDto[], options);
			this.armorSet = new ArmorSet(this.armor);
		}

		options.equipment ??= [];
		if (options.equipment[0] instanceof FarmingEquipment) {
			this.equipment = (options.equipment as FarmingEquipment[]).sort((a, b) => b.fortune - a.fortune);
			for (const e of this.equipment) e.setOptions(options);
		} else {
			this.equipment = FarmingEquipment.fromArray(options.equipment as EliteItemDto[], options);
		}

		// Load in equipment to armor set if it's empty
		if (this.armorSet.equipment.filter((e) => e).length === 0) {
			this.armorSet.setEquipment(this.equipment);
		}

		options.accessories ??= [];
		this.activeAccessories = [];

		if (options.accessories[0] instanceof FarmingAccessory) {
			this.accessories = (options.accessories as FarmingAccessory[]).sort((a, b) => b.fortune - a.fortune);
		} else {
			this.accessories = FarmingAccessory.fromArray(options.accessories as EliteItemDto[]);
		}

		this.permFortune = this.getGeneralFortune();
		this.tempFortune = this.getTempFortune();
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

	getProgress() {
		return getSourceProgress<FarmingPlayer>(this, GENERAL_FORTUNE_SOURCES);
	}

	getGeneralFortune() {
		let sum = 0;
		const breakdown = {} as Record<string, number>;

		// Plots
		const plots = getFortune(this.options.plotsUnlocked, UNLOCKED_PLOTS);
		if (plots > 0) {
			breakdown['Unlocked Plots'] = plots;
			sum += plots;
		}

		// Farming Level
		const level = getFortune(this.options.farmingLevel, FARMING_LEVEL);
		if (level > 0) {
			breakdown['Farming Level'] = level;
			sum += level;
		}

		// Bestiary
		if (this.options.bestiaryKills) {
			const bestiary = fortuneFromPestBestiary(this.options.bestiaryKills);
			if (bestiary > 0) {
				breakdown['Pest Bestiary'] = bestiary;
				sum += bestiary;
			}
		}

		// Armor Set
		const armorSet = this.armorSet.armorFortune;
		if (armorSet > 0) {
			breakdown['Armor Set'] = armorSet;
			sum += armorSet;
		}

		// Eqiupment
		const equipment = this.armorSet.equipmentFortune;
		if (equipment > 0) {
			breakdown['Equipment'] = equipment;
			sum += equipment;
		}

		// Anita Bonus
		const anitaBonus = getFortune(this.options.anitaBonus, ANITA_FORTUNE_UPGRADE);
		if (anitaBonus > 0) {
			breakdown['Anita Bonus Drops'] = anitaBonus;
			sum += anitaBonus;
		}

		// Community Center
		const communityCenter = getFortune(this.options.communityCenter, COMMUNITY_CENTER_UPGRADE);
		if (communityCenter > 0) {
			breakdown['Community Center'] = communityCenter;
			sum += communityCenter;
		}

		// Selected Pet
		const pet = this.selectedPet;
		if (pet && pet.fortune > 0) {
			breakdown[pet.info.name ?? 'Selected Pet'] = pet.fortune;
			sum += pet.fortune;
		}

		// Accessories, only count highest fortune from each family
		const families = new Map<string, FarmingAccessory>();
		this.activeAccessories = [];
		for (const accessory of this.accessories.filter((a) => a.fortune > 0).sort((a, b) => b.fortune - a.fortune)) {
			if (accessory.info.family) {
				if (!families.has(accessory.info.family)) {
					families.set(accessory.info.family, accessory);
					this.activeAccessories.push(accessory);
				} else {
					continue;
				}
			}

			breakdown[accessory.item.name ?? accessory.item.skyblockId ?? 'Accessory [Error]'] = accessory.fortune;
			sum += accessory.fortune;
		}

		// Refined Truffles
		const truffles = Math.min(5, this.options.refinedTruffles ?? 0);
		if (truffles > 0) {
			breakdown['Refined Truffles'] = truffles;
			sum += truffles;
		}

		// Extra Fortune
		for (const extra of this.options.extraFortune ?? []) {
			if (extra.crop) continue;

			breakdown[extra.name ?? 'Extra Fortune'] = extra.fortune;
			sum += extra.fortune;
		}

		const temp = this.getTempFortune();
		if (temp > 0) {
			breakdown['Temporary Fortune'] = temp;
		}

		this.breakdown = breakdown;
		return sum;
	}

	getTempFortune() {
		let sum = 0;
		const breakdown = {} as Record<string, number>;

		if (!this.options.temporaryFortune) {
			this.tempFortuneBreakdown = breakdown;
			return sum;
		}

		for (const entry of Object.keys(this.options.temporaryFortune)) {
			const source = TEMPORARY_FORTUNE[entry as keyof TemporaryFarmingFortune];
			if (!source) continue;

			const fortune = source.fortune(this.options.temporaryFortune);
			if (fortune) {
				breakdown[source.name] = fortune;
				sum += fortune;
			}
		}

		this.tempFortuneBreakdown = breakdown;
		return sum;
	}

	getCropFortune(crop: Crop, tool = this.selectedTool) {
		if (tool) {
			this.selectTool(tool);
		}

		let sum = 0;
		const breakdown = {} as Record<string, number>;

		// Crop upgrades
		const upgrade = getFortune(this.options.cropUpgrades?.[crop], GARDEN_CROP_UPGRADES);
		if (upgrade > 0) {
			breakdown['Crop Upgrade'] = upgrade;
			sum += upgrade;
		}

		// Personal bests
		const personalBest =
			this.options.personalBests?.[getItemIdFromCrop(crop)] ??
			this.options.personalBests?.[getCropDisplayName(crop).replace(/ /g, '')];
		if (personalBest) {
			const fortune = fortuneFromPersonalBestContest(crop, personalBest);
			if (fortune > 0) {
				breakdown['Personal Best'] = fortune;
				sum += fortune;
			}
		}

		// Tool
		const toolFortune = this.selectedTool?.fortune ?? 0;
		if (toolFortune > 0) {
			breakdown['Selected Tool'] = toolFortune;
			sum += toolFortune;
		}

		// Accessories
		//* There's only one accessory family for farming right now
		const accessory = this.accessories.find((a) => !a.info.crops || a.info.crops.includes(crop));
		if (accessory && accessory.fortune > 0) {
			breakdown[accessory.item.name ?? 'Accessories'] = accessory.fortune ?? 0;
			sum += accessory.fortune ?? 0;
		}

		// Exportable Crops
		if (this.options.exportableCrops?.[crop]) {
			const exportable = this.options.exportableCrops[crop];
			if (exportable) {
				breakdown['Exportable Crop'] = EXPORTABLE_CROP_FORTUNE;
				sum += EXPORTABLE_CROP_FORTUNE;
			}
		}

		// Extra Fortune
		for (const extra of this.options.extraFortune ?? []) {
			if (extra.crop !== crop) continue;

			breakdown[extra.name ?? 'Extra Fortune'] = extra.fortune;
			sum += extra.fortune;
		}

		if (crop === Crop.CocoaBeans) {
			const upgrade = getFortune(this.options.cocoaFortuneUpgrade, COCOA_FORTUNE_UPGRADE);
			if (upgrade > 0) {
				breakdown['Cocoa Fortune Upgrade'] = upgrade;
				sum += upgrade;
			}
		}

		return {
			fortune: sum,
			breakdown: breakdown,
		};
	}

	getCropProgress(crop: Crop) {
		return getSourceProgress<{ crop: Crop; player: FarmingPlayer }>({ crop, player: this }, CROP_FORTUNE_SOURCES);
	}

	getWeightCalc(info?: FarmingWeightInfo) {
		return createFarmingWeightCalculator({
			collection: this.options.collection,
			pests: this.options.bestiaryKills,
			farmingXp: this.options.farmingXp,
			levelCapUpgrade: Math.min((this.options.farmingLevel ?? 0) - 50, 0),
			...info,
		});
	}

	getBestTool(crop: Crop) {
		return this.tools.find((t) => t.crop === crop);
	}

	getSelectedCropTool(crop: Crop) {
		return this.selectedTool?.crop === crop ? this.selectedTool : this.getBestTool(crop);
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
