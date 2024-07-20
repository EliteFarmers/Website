# Tools
NPM package for Farming Weight and fortune calculations in Hypixel SkyBlock.

Created specifically for the [EliteWebsite](https://github.com/EliteFarmers/Website) and [EliteBot](https://github.com/EliteFarmers/Bot) projects, but can be used for any project, as long as some credit is given per the license.

## Installation
```bash
npm install farming-weight
```

## Usage

**This is a new package that's changing rapidly, there aren't any comprehensive docs at this time**

```js
import { CreateFarmingWeightCalculator } from 'farming-weight';

const member = // Get SkyBlock member from elsewhere (https://api.hypixel.net/)

const calculator = CreateFarmingWeightCalculator({
	collection: member.collection,
	farmingXp: member.player_data?.experience?.SKILL_FARMING,
	levelCapUpgrade: member.jacobs_contest?.perks?.farming_level_cap,
	anitaBonusFarmingFortuneLevel?: member.jacobs_contest?.perks?.double_drops,
	minions: member.player_data?.crafted_generators, // You should also include minions crafted from other members on the same profile
	contests: Object.values(member.jacob_contests?.contests ?? {}),
	pests: member.bestiary.kills
})

// Can pass in some values instead of calculating them (you can exclude contests above if you do this)
calculator.setEarnedMedals({
	diamond: /* Number of diamond medals */,
	platinum: /* Number of platinum medals */,
	gold: /* Number of gold medals */,
})

const weight = calculator.getWeightInfo();

console.log(weight.totalWeight); // 10000.53 (or whatever the total weight is)
```