export interface TemporaryFarmingFortune {
	pestTurnIn?: number;

	harvestPotion?: boolean;
	chocolateTruffle?: boolean;
	centuryCake?: boolean;
	springFilter?: boolean;
	magic8Ball?: boolean;
	flourSpray?: boolean;
	anitaContest?: boolean;
}

export interface TemporaryFortuneSource {
	name: string;
	wiki: string;
	fortune: (settings: TemporaryFarmingFortune) => number | undefined;
}

export const TEMPORARY_FORTUNE: Record<keyof TemporaryFarmingFortune, TemporaryFortuneSource> = {
	pestTurnIn: {
		name: 'Pest Turn-In',
		wiki: 'https://wiki.hypixel.net/Pesthunter_Phillip#Menu',
		fortune: settings => settings.pestTurnIn
	},
	harvestPotion: {
		name: 'Harvest Harbinger Potion',
		wiki: 'https://wiki.hypixel.net/Harvest_Harbinger_Potion',
		fortune: settings => {
			if (!settings.harvestPotion) return;
			return 50;
		}
	},
	chocolateTruffle: {
		name: 'Refined Dark Cacao Truffle',
		wiki: 'https://wiki.hypixel.net/Refined_Dark_Cacao_Truffle',
		fortune: settings => {
			if (!settings.chocolateTruffle) return;
			return 30;
		}
	},
	centuryCake: {
		name: 'Century Cake',
		wiki: 'https://wiki.hypixel.net/Century_Cake',
		fortune: settings => {
			if (!settings.centuryCake) return;
			return 5;
		}
	},
	springFilter: {
		name: 'Spring Filter',
		wiki: 'https://wiki.hypixel.net/Atmospheric_Filter',
		fortune: settings => {
			if (!settings.springFilter) return;
			return 25;
		}
	},
	magic8Ball: {
		name: 'Magic 8 Ball',
		wiki: 'https://wiki.hypixel.net/Magic_8_Ball',
		fortune: settings => {
			if (!settings.magic8Ball) return;
			return 25;
		}
	},
	flourSpray: {
		name: 'Fine Flour Spray',
		wiki: 'https://wiki.hypixel.net/Fine_Flour#Usage',
		fortune: settings => {
			if (!settings.flourSpray) return;
			return 20;
		}
	},
	anitaContest: {
		name: 'Anita Boosted Contest',
		wiki: 'https://wiki.hypixel.net/Anita%27s_Artifact#Usage',
		fortune: settings => {
			if (!settings.anitaContest) return;
			return 25;
		}
	}
};