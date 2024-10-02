import { FortuneSource } from "./upgrades";

export const GARDEN_CROP_UPGRADES: FortuneSource = {
	name: 'Garden Crop Upgrade',
	cropSpecific: true,
	fortunePerLevel: 5,
	maxLevel: 9,
	wiki: 'https://wiki.hypixel.net/Garden#Crop_Upgrades'
};

export const UNLOCKED_PLOTS: FortuneSource = {
	name: 'Unlocked Plots',
	fortunePerLevel: 3,
	maxLevel: 24,
	wiki: 'https://wiki.hypixel.net/Garden#Stat_Rewards'
};

export const FARMING_LEVEL: FortuneSource = {
	name: 'Farming Level',
	fortunePerLevel: 4,
	maxLevel: 60,
	wiki: 'https://wiki.hypixel.net/Farming#Leveling_Rewards',
};

export const ANITA_FORTUNE_UPGRADE: FortuneSource = {
	name: 'Anita Bonus Fortune',
	fortunePerLevel: 4,
	maxLevel: 15,
	wiki: 'https://wiki.hypixel.net/Anita#Extra_Farming_Fortune',
};

export const COMMUNITY_CENTER_UPGRADE: FortuneSource = {
	name: 'Community Center Upgrade',
	fortunePerLevel: 5,
	maxLevel: 10,
	wiki: 'https://wiki.hypixel.net/Elizabeth#Garden_Farming_Fortune_'
};

export const PEST_BESTIARY_SOURCE: FortuneSource = {
	name: 'Pest Bestiary',
	fortunePerLevel: 0.4,
	maxLevel: 60 / 0.4,
	wiki: 'https://wiki.hypixel.net/Bestiary#Garden_'
};

export const REFINED_TRUFFLE_SOURCE: FortuneSource = {
	name: 'Refined Dark Cacao Truffle',
	fortunePerLevel: 1,
	maxLevel: 5,
	wiki: 'https://wiki.hypixel.net/Refined_Dark_Cacao_Truffle'
};

export const COCOA_FORTUNE_UPGRADE: FortuneSource = {
	name: 'Cocoa Fortune Upgrade',
	cropSpecific: true,
	fortunePerLevel: 1,
	maxLevel: 25,
	wiki: 'https://wiki.hypixel.net/Chocolate_Factory#Chocolate_Shop'
};