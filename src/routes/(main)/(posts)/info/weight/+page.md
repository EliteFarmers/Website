---
title: Farming Weight
date: 2025-11-02
author: Kaeso
category: weight
description: Farming weight is a number that essentially represents how long and how efficient a player has been farming.
blueprint: page
---

<script lang="ts">
	import BonusTable from '$comp/info/bonustable.svelte';
	import CropTable from '$comp/info/croptable.svelte';
	import PestTable from '$comp/info/pest-table.svelte';
</script>

# Farming Weight

## What is Farming Weight?

Farming weight is a number that essentially represents how long and how efficient a player has been
farming. The basic idea is to balance the collection between crops, so one player's crop collection can
be compared with another players collection of a different crop. The focus on crop collections means
that Farming XP is not a factor in this calculation outside of one time bonus weight amounts. This is to
ensure that players who farm for XP crops don't have an unfair advantage in farming weight gain over
players who farm using other methods.

### Why should I care?

You don't need to! Farming weight is just a fun stat for farmers to look at. Feel free to ignore it and
just use other parts of the website.

## Farming Weight Per Crop

Each crop has a different weight. The weight of a crop is determined by the theoretical maximum amount
of crops that can be farmed in the same time span. The following table shows the amount of each crop
needed to increase your farming weight by 1.

<CropTable />

Base Drops Per Break refers to the average amount of drops you get from breaking a crop without any
buffs. Sugar Cane and Cactus actually have a base drop of 1 per block, but because you can break 2
blocks at once, 2 is noted here. Full calculation breakdowns will be added in the future.

<sub>\* Mushroom weight is calculated dynamically because of the Mooshroom Cow pet. Because Cactus and Sugar
Cane are both 2 blocks per break, the cow's perk gives you twice the normal rate of mushroom drops than
from other crops. To counter this, you get half the weight from mushrooms for the ratio of Cactus and
Sugar Cane farmed out of the total weight, and the remainder is calculated normally.</sub>

## Pest Weight Adjustment

The introduction of pests to the garden has brought a new (and unreliable) source of crop collection into
the game which needs to be accounted for in farming weight. If pest drops were balanced in-game there would
be no issue with them counting towards farming weight, but they aren't. To counteract this unbalance, the
weight calculation subtracts an averaged amount of crop collections per pest kill before applying the
formula. The subtracted amount is also in brackets as shown below to compensate for fortune differences.
Your collection numbers on the site are still accurate, this subtraction is just done internally during the
farming weight calculation.

## Pest Brackets

The following table shows the amount of collection per crop that is subtracted based on the number of
pests you have killed. The amounts are calculated in brackets, with an associated farming fortune noted
that was used to calculate your average drops per pest kill.

<PestTable />

<sub>This system is progressive, which means that as you hit the next bracket, the previous bracket's pest
amounts are still using their associated bracket's fortune values.</sub>

## Bonus Weight

There are a few sources of bonus weight that can be obtained. These are not intended to be a significant
source of weight, but rather a small bonus to help players who are just starting out. As well as a fun
way to get a little extra weight for completing different farming content in the game.

<BonusTable />

More bonus weight sources may be added in the future.
