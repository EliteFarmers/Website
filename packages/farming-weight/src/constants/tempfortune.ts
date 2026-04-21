export interface TemporaryFarmingFortune {
	pestTurnIn?: number;

	harvestPotion?: boolean;
	chocolateTruffle?: boolean;
	centuryCake?: boolean;
	springFilter?: boolean;
	magic8Ball?: boolean;
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
		wiki: 'https://w.elitesb.gg/Pesthunter_Phillip#Menu',
		fortune: (settings) => settings.pestTurnIn,
	},
	harvestPotion: {
		name: 'Harvest Harbinger Potion',
		wiki: 'https://w.elitesb.gg/Harvest_Harbinger_Potion',
		fortune: (settings) => {
			if (!settings.harvestPotion) return;
			return 50;
		},
	},
	chocolateTruffle: {
		name: 'Refined Dark Cacao Truffle',
		wiki: 'https://w.elitesb.gg/Refined_Dark_Cacao_Truffle',
		fortune: (settings) => {
			if (!settings.chocolateTruffle) return;
			return 30;
		},
	},
	centuryCake: {
		name: 'Century Cake',
		wiki: 'https://w.elitesb.gg/Century_Cake',
		fortune: (settings) => {
			if (!settings.centuryCake) return;
			return 5;
		},
	},
	springFilter: {
		name: 'Spring Filter',
		wiki: 'https://w.elitesb.gg/Atmospheric_Filter',
		fortune: (settings) => {
			if (!settings.springFilter) return;
			return 25;
		},
	},
	magic8Ball: {
		name: 'Magic 8 Ball',
		wiki: 'https://w.elitesb.gg/Magic_8_Ball',
		fortune: (settings) => {
			if (!settings.magic8Ball) return;
			return 25;
		},
	},
	anitaContest: {
		name: 'Anita Boosted Contest',
		wiki: 'https://w.elitesb.gg/Anita%27s_Artifact#Usage',
		fortune: (settings) => {
			if (!settings.anitaContest) return;
			return 25;
		},
	},
};
