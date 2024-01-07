import { Crop } from '../constants/crops';
import { FortuneFromPersonalBestContest } from '../constants/personalbests';
import { FortuneFromPestBestiary } from '../constants/pests';
import { FarmingPetType } from '../constants/pets';
import { FORTUNE_PER_ANITA_BONUS, FORTUNE_PER_CROP_UPGRADE, FORTUNE_PER_FARMING_LEVEL, FORTUNE_PER_PLOT } from '../constants/specific';
import { CropDisplayName, ItemIdFromCrop } from '../util/names';
import { FarmingAccessory } from './farmingaccessory';
import { ArmorSet, FarmingArmor } from './farmingarmor';
import { FarmingTool } from './farmingtool';
import { Item } from './item';
import { LotusGear } from './lotusgear';

export interface FortuneMissingFromAPI {
	cropUpgrades?: Record<Crop, number>;
	gardenLevel?: number;
	plotsUnlocked?: number;
	uniqueVisitors?: number;
	milestones?: Partial<Record<Crop, number>>;
}

export interface PlayerOptions extends FortuneMissingFromAPI {
	collection?: Record<string, number>;
	farmingXp?: number;
	farmingLevel?: number;
	strength?: number;

	tools: Item[];
	armor: Item[];
	equipment: Item[];
	accessories: Item[];
	pets: FarmingPetType[];

	personalBests?: Record<string, number>;
	bestiaryKills?: Record<string, number>;
	anitaBonus?: number;
}

export function CreatePlayer(options: PlayerOptions) {
	return new Player(options);
}

class Player {
	declare options: PlayerOptions;
	declare fortune: number;
	declare breakdown: Record<string, number>;

	declare tools: FarmingTool[];
	declare armor: FarmingArmor[];
	declare armorSet: ArmorSet;
	declare equipment: LotusGear[];
	declare accessories: FarmingAccessory[];

	declare selectedTool?: FarmingTool;

	constructor(options: PlayerOptions) {
		this.options = options;

		this.tools = options.tools
			.filter((item) => FarmingTool.isValid(item))	
			.map((item) => new FarmingTool(item, options))
			.sort((a, b) => b.fortune - a.fortune);

		this.armor = options.armor
			.filter((item) => FarmingArmor.isValid(item))
			.map((item) => new FarmingArmor(item, options))
			.sort((a, b) => b.fortune - a.fortune);

		this.armorSet = new ArmorSet(this.armor.sort((a, b) => b.fortune - a.fortune));

		this.equipment = options.equipment
			.filter((item) => LotusGear.isValid(item))
			.map((item) => new LotusGear(item, options))
			.sort((a, b) => b.fortune - a.fortune);

		this.accessories = options.accessories
			.filter((item) => FarmingAccessory.isValid(item))
			.map((item) => new FarmingAccessory(item))
			.sort((a, b) => b.fortune - a.fortune);

		this.fortune = this.getGeneralFortune();
	}

	changeArmor(armor: FarmingArmor[]) {
		this.armorSet = new ArmorSet(armor.sort((a, b) => b.fortune - a.fortune));
	}

	selectTool(tool: FarmingTool) {
		this.selectedTool = tool;
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
			const bestiary = FortuneFromPestBestiary(this.options.bestiaryKills);
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
		const lotusGear = this.equipment.reduce((a, b) => a + b.fortune, 0);
		if (lotusGear > 0) {
			breakdown['Lotus Equipment'] = lotusGear;
			sum += lotusGear;
		}

		// Anita Bonus
		const anitaBonus = (this.options.anitaBonus ?? 0) * FORTUNE_PER_ANITA_BONUS;
		if (anitaBonus > 0) {
			breakdown['Anita Bonus Drops'] = anitaBonus;
			sum += anitaBonus;
		}

		// Accessories
		//* There's only one accessory family for farming right now
		const accessory = this.accessories.find((a) => a.info.crops === undefined);
		if (accessory && accessory.fortune > 0) {
			breakdown[accessory.item.name ?? 'Accessories'] = accessory.fortune ?? 0;
			sum += accessory.fortune ?? 0;
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
			this.options.personalBests?.[ItemIdFromCrop(crop)]
			?? this.options.personalBests?.[CropDisplayName(crop).replace(/ /g, '')]
		if (personalBest) {
			const fortune = FortuneFromPersonalBestContest(crop, personalBest);
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
