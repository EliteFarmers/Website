export interface TemporaryFarmingFortune {
	pestTurnIn?: number;

	harvestPotion?: boolean;
	chocolateTruffle?: boolean;
	centuryCake?: boolean;
	springFilter?: boolean;
	magic8Ball?: boolean;
	flourSpray?: boolean;
}

export interface TemporaryFortuneSource {
	name: string;
	fortune: (settings: TemporaryFarmingFortune) => number | undefined;
}

export const TEMPORARY_FORTUNE: Record<keyof TemporaryFarmingFortune, TemporaryFortuneSource> = {
	pestTurnIn: {
		name: 'Pest Turn-In',
		fortune: settings => settings.pestTurnIn
	},
	harvestPotion: {
		name: 'Harvest Harbinger Potion',
		fortune: settings => {
			if (!settings.harvestPotion) return;
			return 50;
		}
	},
	chocolateTruffle: {
		name: 'Refined Dark Chocolate Truffle',
		fortune: settings => {
			if (!settings.chocolateTruffle) return;
			return 30;
		}
	},
	centuryCake: {
		name: 'Century Cake',
		fortune: settings => {
			if (!settings.centuryCake) return;
			return 5;
		}
	},
	springFilter: {
		name: 'Spring Filter',
		fortune: settings => {
			if (!settings.springFilter) return;
			return 25;
		}
	},
	magic8Ball: {
		name: 'Magic 8 Ball',
		fortune: settings => {
			if (!settings.magic8Ball) return;
			return 25;
		}
	},
	flourSpray: {
		name: 'Fine Flour Spray',
		fortune: settings => {
			if (!settings.flourSpray) return;
			return 20;
		}
	}
};