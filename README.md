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

const member = // Get SkyBlock member from elsewhere

const calculator = CreateFarmingWeightCalculator({
	collection: member.collection,
	farmingXp: member.experience_skill_farming,
	levelCapUpgrade: member.jacob2?.perks?.farming_level_cap,
	anitaBonusFarmingFortuneLevel?: member.jacob2?.perks?.anita_bonus_farming_fortune_level,
	minions: member.crafted_generators, // You should also include minions crafted from other members on the same profile
	contests: member.jacob2?.contests,
}).setEarnedGoldMedals(earnedGoldMedals) // Can pass in some values instead of calculating them (you can exclude contests if you do this)

const weight = calculator.getWeightInfo();

console.log(weight.totalWeight); // 10000.53 (or whatever the total weight is)
```