import { Stat } from './stats.js';

export interface TemporaryFarmingFortune {
	pestTurnIn?: number;

	harvestPotion?: boolean;
	chocolateTruffle?: boolean;
	centuryCake?: boolean;
	springFilter?: boolean;
	magic8Ball?: boolean;
	anitaContest?: boolean;
	celestialMasonJar?: boolean;
	melonJuiceMixin?: boolean;
	finnsFocaccia?: boolean;
	stinkyCheesePotion?: boolean;
}

export interface TemporaryFortuneSource {
	name: string;
	wiki: string;
	fortune: (settings: TemporaryFarmingFortune) => number | undefined;
	stat?: Stat;
	hyperchargeEligible?: boolean;
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
		hyperchargeEligible: false,
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
		hyperchargeEligible: false,
		fortune: (settings) => {
			if (!settings.anitaContest) return;
			return 25;
		},
	},
	celestialMasonJar: {
		name: 'Celestial Mason Jar',
		wiki: 'https://w.elitesb.gg/Celestial_Mason_Jar',
		fortune: (settings) => {
			if (!settings.celestialMasonJar) return;
			return 15;
		},
	},
	melonJuiceMixin: {
		name: 'Melon Juice Mixin',
		wiki: 'https://w.elitesb.gg/Melon_Juice_Mixin',
		hyperchargeEligible: false,
		fortune: (settings) => {
			if (!settings.melonJuiceMixin) return;
			return 15;
		},
	},
	finnsFocaccia: {
		name: "Finn's Focaccia",
		wiki: 'https://w.elitesb.gg/Finn%27s_Focaccia',
		stat: Stat.Overbloom,
		fortune: (settings) => {
			if (!settings.finnsFocaccia) return;
			return 5;
		},
	},
	stinkyCheesePotion: {
		name: 'Douce Pluie de Stinky Cheese Potion',
		wiki: 'https://w.elitesb.gg/Douce_Pluie_De_Stinky_Cheese',
		stat: Stat.BonusPestChance,
		fortune: (settings) => {
			if (!settings.stinkyCheesePotion) return;
			return 20;
		},
	},
};
