import type { ItemDefinition } from './definitions.js';
import {
	BlossomBelt,
	BlossomBracelet,
	BlossomCloak,
	BlossomNecklace,
	LotusBelt,
	LotusBracelet,
	LotusCloak,
	LotusNecklace,
	PesthuntersBelt,
	PesthuntersCloak,
	PesthuntersGloves,
	PesthuntersNecklace,
	PestVest,
	ZorrosCape,
} from './equipment/index.js';

export const FARMING_EQUIPMENT_INFO: Partial<Record<string, ItemDefinition>> = {
	LOTUS_BRACELET: new LotusBracelet(),
	LOTUS_BELT: new LotusBelt(),
	LOTUS_NECKLACE: new LotusNecklace(),
	LOTUS_CLOAK: new LotusCloak(),
	BLOSSOM_BRACELET: new BlossomBracelet(),
	BLOSSOM_BELT: new BlossomBelt(),
	BLOSSOM_NECKLACE: new BlossomNecklace(),
	BLOSSOM_CLOAK: new BlossomCloak(),
	ZORROS_CAPE: new ZorrosCape(),
	PEST_VEST: new PestVest(),
	PESTHUNTERS_GLOVES: new PesthuntersGloves(),
	PESTHUNTERS_BELT: new PesthuntersBelt(),
	PESTHUNTERS_CLOAK: new PesthuntersCloak(),
	PESTHUNTERS_NECKLACE: new PesthuntersNecklace(),
};

export const VISITORS_SERVED_BONUS = {
	1: 1,
	5: 2,
	10: 3,
	20: 4,
	50: 5,
	75: 6,
	100: 7,
	150: 8,
	250: 9,
	500: 10,
	1000: 11,
	2000: 12,
	3000: 13,
	4000: 14,
	5000: 15,
};

export const GREEN_THUMB_MULTIPLIER = {
	1: 0.05,
	2: 0.1,
	3: 0.15,
	4: 0.2,
	5: 0.25,
};
