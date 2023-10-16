import { Crop } from '../constants/crops';
import { FarmingPetType } from '../constants/pets';
import { FarmingArmor } from './farmingarmor';
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
	pets: FarmingPetType[];
}

export function CreatePlayer(options: PlayerOptions) {
	return new Player(options);
}

class Player {
	declare options: PlayerOptions;

	declare armor: FarmingArmor[];
	declare tools: FarmingTool[];
	declare equipment: LotusGear[];

	constructor(options: PlayerOptions) {
		this.options = options;
		this.armor = options.armor.filter((item) => FarmingArmor.isValid(item)).map((item) => new FarmingArmor(item));

		this.tools = options.tools.filter((item) => FarmingTool.isValid(item)).map((item) => new FarmingTool(item));

		this.equipment = options.equipment.filter((item) => LotusGear.isValid(item)).map((item) => new LotusGear(item));
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
