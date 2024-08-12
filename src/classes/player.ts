import { Crop, EXPORTABLE_CROP_FORTUNE } from '../constants/crops';
import { fortuneFromPersonalBestContest } from '../constants/personalbests';
import { fortuneFromPestBestiary } from '../util/pests';
import { FarmingPetType } from '../constants/pets';
import {
	FORTUNE_PER_ANITA_BONUS,
	FORTUNE_PER_COMMUNITY_CENTER,
	FORTUNE_PER_CROP_UPGRADE,
	FORTUNE_PER_FARMING_LEVEL,
	FORTUNE_PER_PLOT,
} from '../constants/specific';
import { getCropDisplayName, getItemIdFromCrop } from '../util/names';
import { FarmingAccessory } from './farmingaccessory';
import { ArmorSet, FarmingArmor } from './farmingarmor';
import { FarmingPet } from './farmingpet';
import { FarmingTool } from './farmingtool';
import { EliteItemDto } from './item';
import { FarmingEquipment } from './farmingequipment';

export interface FortuneMissingFromAPI {
	cropUpgrades?: Record<Crop, number>;
	gardenLevel?: number;
	plotsUnlocked?: number;
	uniqueVisitors?: number;
	communityCenter?: number;
	milestones?: Partial<Record<Crop, number>>;
	exportableCrops?: Partial<Record<Crop, boolean>>;
	refinedTruffles?: number;
}

export interface ExtraFarmingFortune {
	crop?: Crop;
	name?: string;
	fortune: number;
}

export interface PlayerOptions extends FortuneMissingFromAPI {
	collection?: Record<string, number>;
	farmingXp?: number;
	farmingLevel?: number;
	strength?: number;

	tools?: EliteItemDto[] | FarmingTool[];
	armor?: EliteItemDto[] | FarmingArmor[] | ArmorSet;
	equipment?: EliteItemDto[] | FarmingEquipment[];
	accessories?: EliteItemDto[] | FarmingAccessory[];
	pets?: FarmingPetType[] | FarmingPet[];

	selectedTool?: FarmingTool;
	selectedPet?: FarmingPet;

	personalBests?: Record<string, number>;
	bestiaryKills?: Record<string, number>;
	anitaBonus?: number;

	extraFortune?: ExtraFarmingFortune[];
	zorro?: boolean;
}

export function createFarmingPlayer(options: PlayerOptions) {
	return new FarmingPlayer(options);
}

export class FarmingPlayer {
	declare options: PlayerOptions;
	declare fortune: number;
	declare breakdown: Record<string, number>;

	declare tools: FarmingTool[];
	declare armor: FarmingArmor[];
	declare armorSet: ArmorSet;
	declare equipment: FarmingEquipment[];
	declare accessories: FarmingAccessory[];
	declare pets: FarmingPet[];

	declare selectedTool?: FarmingTool;
	declare selectedPet?: FarmingPet;

	constructor(options: PlayerOptions) {
		this.options = options;

		options.tools ??= [];
		if (options.tools[0] instanceof FarmingTool) {
			this.tools = options.tools as FarmingTool[];
			for (const tool of this.tools) tool.setOptions(options);
		} else {
			this.tools = FarmingTool.fromArray(options.tools as EliteItemDto[], options);
		}

		this.selectedTool = this.options.selectedTool ?? this.tools[0];

		options.pets ??= [];
		if (options.pets[0] instanceof FarmingPet) {
			this.pets = (options.pets as FarmingPet[]).sort((a, b) => b.fortune - a.fortune);
			for (const pet of this.pets) pet.setOptions(options);
		} else {
			this.pets = FarmingPet.fromArray(options.pets as EliteItemDto[], options);
		}

		this.selectedPet = this.options.selectedPet;

		options.armor ??= [];
		if (options.armor instanceof ArmorSet) {
			this.armorSet = options.armor;
			this.armor = this.armorSet.pieces;
			for (const a of this.armor) a.setOptions(options);
			this.armorSet.getFortuneBreakdown(true);
		} else if (options.armor[0] instanceof FarmingArmor) {
			this.armor = (options.armor as FarmingArmor[]).sort((a, b) => b.fortune - a.fortune);
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

		options.accessories ??= [];
		if (options.accessories[0] instanceof FarmingAccessory) {
			this.accessories = (options.accessories as FarmingAccessory[]).sort((a, b) => b.fortune - a.fortune);
		} else {
			this.accessories = FarmingAccessory.fromArray(options.accessories as EliteItemDto[]);
		}

		this.fortune = this.getGeneralFortune();
	}

	changeArmor(armor: FarmingArmor[]) {
		this.armorSet = new ArmorSet(armor.sort((a, b) => b.fortune - a.fortune));
	}

	selectTool(tool: FarmingTool) {
		this.selectedTool = tool;
		this.fortune = this.getGeneralFortune();
	}

	selectPet(pet: FarmingPet) {
		this.selectedPet = pet;
		this.fortune = this.getGeneralFortune();
	}

	setStrength(strength: number) {
		this.options.strength = strength;
		for (const pet of this.pets) {
			pet.fortune = pet.getFortune();
		}
		this.fortune = this.getGeneralFortune();
	}

	getGeneralFortune() {
		let sum = 0;
		const breakdown = {} as Record<string, number>;

		// Plots
		const plots = FORTUNE_PER_PLOT * (this.options.plotsUnlocked ?? 0);
		if (plots > 0) {
			breakdown['Unlocked Plots'] = plots;
			sum += plots;
		}

		// Farming Level
		const level = FORTUNE_PER_FARMING_LEVEL * (this.options.farmingLevel ?? 0);
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
		const armorSet = this.armorSet.fortune;
		if (armorSet > 0) {
			breakdown['Armor Set'] = armorSet;
			sum += armorSet;
		}

		// Lotus Gear
		const equipment = this.equipment.reduce((a, b) => a + b.fortune, 0);
		if (equipment > 0) {
			breakdown['Equipment'] = equipment;
			sum += equipment;
		}

		// Anita Bonus
		const anitaBonus = (this.options.anitaBonus ?? 0) * FORTUNE_PER_ANITA_BONUS;
		if (anitaBonus > 0) {
			breakdown['Anita Bonus Drops'] = anitaBonus;
			sum += anitaBonus;
		}

		// Community Center
		const communityCenter = (this.options.communityCenter ?? 0) * FORTUNE_PER_COMMUNITY_CENTER;
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
		for (const accessory of this.accessories.filter((a) => a.fortune > 0).sort((a, b) => b.fortune - a.fortune)) {
			if (accessory.info.family) {
				if (!families.has(accessory.info.family)) {
					families.set(accessory.info.family, accessory);
				} else {
					continue;
				}
			}

			breakdown[accessory.item.name ?? accessory.item.skyblockId ?? 'Accessory [Error]'] = accessory.fortune;
			sum += accessory.fortune;
		}

		// Refined Truffles
		const truffles = Math.min(5, (this.options.refinedTruffles ?? 0));
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

		this.breakdown = breakdown;
		return sum;
	}

	getCropFortune(crop: Crop, tool = this.selectedTool) {
		if (tool) {
			this.selectTool(tool);
		}

		let sum = 0;
		const breakdown = {} as Record<string, number>;

		// Crop upgrades
		const upgrade = FORTUNE_PER_CROP_UPGRADE * (this.options.cropUpgrades?.[crop] ?? 0);
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
		const accessory = this.accessories.find((a) => a.info.crops && a.info.crops.includes(crop));
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

		return {
			fortune: sum,
			breakdown,
		};
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
