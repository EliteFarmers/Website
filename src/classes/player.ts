import { Crop } from '../constants/crops';

interface PlayerOptions {
	collection?: Record<string, number>;
	fortuneSources?: Record<string, number>;
	cropSpecificFortune?: Record<Crop, number>;
	farmingXp?: number;
	farmingLevel?: number;
}

export function CreatePlayer(options: PlayerOptions) {
	return new Player(options);
}

class Player {
	declare collection: Partial<Record<Crop, number>>;
	declare fortuneSources: Record<string, number>;
	declare cropSpecificFortune: Partial<Record<Crop, number>>;
	declare farmingXp: number;
	declare farmingLevel: number;

	constructor(options: PlayerOptions) {
		this.collection = options.collection ?? {};
		this.fortuneSources = options.fortuneSources ?? {};
		this.cropSpecificFortune = options.cropSpecificFortune ?? {};
		this.farmingXp = options.farmingXp ?? 0;
		this.farmingLevel = options.farmingLevel ?? 0;
	}

	addFortune(name: string, amount: number) {
		this.fortuneSources[name] = amount;
		return this;
	}

	addCropFortune(crop: Crop, amount: number) {
		this.cropSpecificFortune[crop] = amount;
		return this;
	}

	setLotusGear() {}

	getFortune() {
		const general = Object.values(this.fortuneSources).reduce((a, b) => a + b, 0);
		return general;
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
