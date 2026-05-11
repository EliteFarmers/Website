# Farming Weight

NPM package for Farming Weight and fortune calculations in Hypixel SkyBlock.

Created specifically for the [EliteWebsite](https://github.com/EliteFarmers/Website) and [EliteBot](https://github.com/EliteFarmers/Bot) projects, but can be used for any project, as long as some credit is given per the license.

**This is a new package that's changing rapidly, there aren't any comprehensive docs at this time**

## Installation

```bash
npm install farming-weight
```

## Usage

This package is made with TypeScript, and has type definitions included. While there is a lack of docs, relevant types and autocomplete should help a lot with understanding the package.

### General philosophy

The goal of this package is to provide an easy way to pass in existing data and get Farming Weight information back. With this in mind, the **input data is not always raw Hypixel API responses, as those are prone to change**. While this may be inconvenient for some projects, it should be easy enough to convert the data to the format expected by this package, and it moves the burden of keeping up with Hypixel API changes out of this package.

### Farming Weight Calculator

The `createFarmingWeightCalculator` function is the main entry point for this package. It takes in a single object with data required for the full farming weight calculation. Data can be skipped, and the weight calculator will skip the related weight that would be calculated from that data.

```ts
import { createFarmingWeightCalculator } from 'farming-weight';

const member = // Get SkyBlock member from elsewhere (https://api.hypixel.net/)

const calculator = createFarmingWeightCalculator({
	collection: member.collection,
	farmingXp: member.player_data?.experience?.SKILL_FARMING,
	levelCapUpgrade: member.jacobs_contest?.perks?.farming_level_cap,
	anitaBonusFarmingFortuneLevel?: member.jacobs_contest?.perks?.double_drops,
	minions: member.player_data?.crafted_generators, // You should also include minions crafted from other members on the same profile
	contests: Object.values(member.jacob_contest?.contests ?? {}),
	pests: member.bestiary.kills
})

// Can pass in some values instead of calculating them (you can exclude contests above if you do this)
calculator.setEarnedMedals({
	diamond: /* Number of diamond medals */,
	platinum: /* Number of platinum medals */,
	gold: /* Number of gold medals */,
})

const weight = calculator.getWeightInfo();

console.log(weight.totalWeight);
// 10000.53 (or whatever the total weight is)

console.log(weight.bonusSources);
// { "Contest Medals": 123.25, "Farming Level": 250, ... }

```

### Rates Calculator

This package also contains an effect-driven rates calculator, which can be used to calculate farming drops and NPC profit for a player's active crop.

```ts
import { createFarmingPlayer, Crop } from 'farming-weight';

const player = createFarmingPlayer({
	tools: farmingTools,
	armor: armorSet,
	equipment,
	accessories,
	pets,
	attributes,
	chips,
	selectedCrop: Crop.Wheat,
});

const drops = player.getRates(Crop.Wheat, 24000); // 100% efficiency for 20 minutes

console.log(drops.collection); // 123000 (or whatever the collection is)
console.log(drops.effectsBreakdown); // { "Sunset": 5, ... }
console.log(drops.appliedEffects.CROPIE); // Per-drop effect details
```

For lower-level callers that already collect effects, use the effect calculator directly:

```ts
import { calculateDetailedDropsFromEffects, Crop } from 'farming-weight';

const crop = Crop.Wheat;
const env = player.buildEnvironment(crop);
const effects = player.collectEffects(env);

const drops = calculateDetailedDropsFromEffects({
	crop,
	blocksBroken: 24000,
	farmingFortune: player.getCropFortune(crop).fortune + player.fortune,
	bountiful: player.getBestTool(crop)?.bountiful ?? false,
	effects,
	env,
});

console.log(drops.effectsBreakdown);
console.log(drops.appliedEffects);
```

### FarmingPlayer Calculator

The `createFarmingPlayer` function is used to create a `FarmingPlayer` object, which can be used to calculate fortune and other player-specific farming values. However, this approach is limited by the data available in Hypixel's API, which won't include every fortune source.

```ts
const options = {
	tools: farmingTools // Array of FarmingTool objects, or EliteItemFto objects (not raw NBT data)
	armor: armorSet // Array of FarmingArmor objects, an ArmorSet object, or EliteItemDto objects
	equipment: equipment // Array of FarmingEquipment objects, or EliteItemDto objects
	accessories: accessories // Array of FarmingAccessory objects, or EliteItemDto objects
	pets: pets // Array of FarmingPet objects, or raw Hypixel API pet data

	// ... other options (check the type definition)
} satisfies PlayerOptions;

const player = createFarmingPlayer(options);
// Get a player's Wheat fortune
const cropFortune = player.getCropFortune(Crop.Wheat);

// Calculate drops using the player's scalar stats plus scoped effects
const rates = player.getRates(Crop.Wheat, blocksBroken);

console.log(cropFortune.fortune);
console.log(rates.items);
console.log(rates.appliedEffects);
```
