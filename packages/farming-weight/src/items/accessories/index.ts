import type { ItemDefinition } from '../definitions.js';
import { CropieTalisman, FermentoArtifact, HelianthusRelic, SquashRing } from './fermento-family.js';
import {
	FreshlyBakedArtifact,
	FreshlyBakedHeirloom,
	FreshlyBakedRelic,
	FreshlyBakedRing,
	FreshlyBakedTalisman,
} from './freshly-baked.js';
import { PowerRelic } from './power-relic.js';
import { AtmosphericFilterAccessory, Magic8BallAccessory } from './special.js';

export * from './base.js';
export * from './fermento-family.js';
export * from './freshly-baked.js';
export * from './power-relic.js';
export * from './special.js';

export const FARMING_ACCESSORY_CLASSES = {
	HELIANTHUS_RELIC: new HelianthusRelic(),
	FERMENTO_ARTIFACT: new FermentoArtifact(),
	SQUASH_RING: new SquashRing(),
	CROPIE_TALISMAN: new CropieTalisman(),
	POWER_RELIC: new PowerRelic(),
	MAGIC_8_BALL: new Magic8BallAccessory(),
	ATMOSPHERIC_FILTER: new AtmosphericFilterAccessory(),
	FRESHLY_BAKED_HEIRLOOM: new FreshlyBakedHeirloom(),
	FRESHLY_BAKED_RELIC: new FreshlyBakedRelic(),
	FRESHLY_BAKED_ARTIFACT: new FreshlyBakedArtifact(),
	FRESHLY_BAKED_RING: new FreshlyBakedRing(),
	FRESHLY_BAKED_TALISMAN: new FreshlyBakedTalisman(),
} satisfies Record<string, ItemDefinition>;

export const FARMING_ACCESSORIES_INFO: Partial<Record<string, ItemDefinition>> = FARMING_ACCESSORY_CLASSES;
