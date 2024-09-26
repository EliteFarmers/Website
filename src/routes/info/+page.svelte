<script lang="ts">
	import CropTable from './croptable.svelte';
	import BonusTable from './bonustable.svelte';
	import Head from '$comp/head.svelte';
	import { CREDITS } from '$content/credits';
	import * as Card from '$ui/card';
	import { FAQ } from '$content/faq';
	import type { PageData } from './$types';
	import { PUBLIC_BADGE_IMAGE_URL } from '$env/static/public';
	import PestTable from './pest-table.svelte';

	export let data: PageData;
	$: weights = data.weights;
</script>

<Head title="Information" description="View all information about the site and how farming weight is calculated." />

<main class="flex flex-col justify-center items-center w-full">
	<section class="flex flex-col justify-center items-center w-full">
		<h1 class="text-center text-3xl mt-16 mb-8">Weight Information</h1>
		<article class="max-w-4xl w-full px-4">
			<h2 class="text-2xl my-8">What is Farming Weight?</h2>
			<p class="text-lg my-4">
				Farming weight is a number that essentially represents how long and how efficient a player has been
				farming. The basic idea is to balance the collection between crops, so one player's crop collection can
				be compared with another players collection of a different crop. The focus on crop collections means
				that Farming XP is not a factor in this calculation outside of one time bonus weight amounts. This is to
				ensure that players who farm for XP crops don't have an unfair advantage in farming weight gain over
				players who farm using other methods.
			</p>
		</article>
		<article class="max-w-4xl w-full px-4">
			<h2 class="text-2xl my-8">Farming Weight Per Crop</h2>
			<p class="text-lg my-4">
				Each crop has a different weight. The weight of a crop is determined by the theoretical maximum amount
				of crops that can be farmed in the same timespan. The following table shows the amount of each crop
				needed to increase your farming weight by 1.
			</p>
			<CropTable {weights} />
			<p class="text-sm mt-4 mb-2">
				Base Drops Per Break refers to the average amount of drops you get from breaking a crop without any
				buffs. Sugar Cane and Cactus actually have a base drop of 1 per block, but because you can break 2
				blocks at once, 2 is noted here. Full calculation breakdowns will be added in the future.
			</p>
			<p class="text-sm mb-4">
				* Mushroom weight is calculated dynamically because of the Mooshroom Cow pet. Because Cactus and Sugar
				Cane are both 2 blocks per break, the cow's perk gives you twice the normal rate of mushroom drops than
				from other crops. To counter this, you get half the weight from mushrooms for the ratio of Cactus and
				Sugar Cane farmed out of the total weight, and the remainder is calculated normally.
			</p>
		</article>
	</section>
	<section class="flex flex-col justify-center items-center w-full" id="Pests">
		<h1 class="text-center text-3xl mt-16 mb-8">Pest Weight Adjustment</h1>
		<p class="text-lg my-4 max-w-4xl w-full px-4">
			The introduction of pests to the garden has brought a new (and unreliable) source of crop collection into
			the game which needs to be accounted for in farming weight. If pest drops were balanced in-game there would
			be no issue with them counting towards farming weight, but they aren't. To counteract this unbalance, the
			weight calculation subtracts an averaged amount of crop collections per pest kill before applying the
			formula. The subtracted amount is also in brackets as shown below to compensate for fortune differences.
			Your collection numbers on the site are still accurate, this subtraction is just done internally during the
			farming weight calculation.
		</p>
		<article class="max-w-4xl w-full px-4">
			<h2 class="text-2xl my-8">Pest Brackets</h2>
			<p class="text-lg my-4">
				The following table shows the amount of collection per crop that is subtracted based on the number of
				pests you have killed. The amounts are calculated in brackets, with an associated farming fortune noted
				that was used to calculate your average drops per pest kill.
			</p>
			<PestTable {weights} />
			<p class="text-sm mt-4 mb-2">
				This system is progressive, which means that as you hit the next bracket, the previous bracket's pest
				amounts are still using their associated bracket's fortune values.
			</p>
		</article>
	</section>
	<section class="flex flex-col justify-center items-center w-full">
		<h1 class="text-center text-3xl mt-16 mb-8">Bonus Weight</h1>
		<article class="max-w-4xl w-full px-4">
			<p class="text-lg my-4">
				There are a few sources of bonus weight that can be obtained. These are not intended to be a significant
				source of weight, but rather a small bonus to help players who are just starting out. As well as a fun
				way to get a little extra weight for completing different farming content in the game.
			</p>
			<BonusTable />
			<p class="text-sm my-4">More bonus weight sources may be added in the future.</p>
		</article>
	</section>
	<section class="flex flex-col justify-center items-center w-full" id="FAQ">
		<h1 class="text-center text-3xl mt-16 mb-8">F.A.Q.</h1>
		{#each FAQ as faq}
			<article class="max-w-4xl w-full px-4">
				<h2 class="text-2xl my-8">{faq.question}</h2>
				<p class="text-lg my-4">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html faq.answer}
				</p>
			</article>
		{/each}
	</section>
	<section class="flex flex-col justify-center items-center w-full" id="Badges">
		<h1 class="text-center text-3xl mt-16 mb-8">Badges</h1>
		<article class="w-full max-w-4xl px-4">
			<p class="text-lg">
				Badges are cosmetic profile decorations players can display on the website. More may be added at any
				time, and they are configurable in your account settings.
			</p>
			<div class="flex flex-col gap-4">
				<h3 class="text-2xl mt-4">List of Badges</h3>
				{#each data?.badges ?? [] as badge}
					<div class="flex flex-row gap-4 items-center">
						<img
							src="{PUBLIC_BADGE_IMAGE_URL}{badge.imageId}.png"
							alt={badge.name}
							class="w-18 h-6 md:w-24 md:h-8 rounded-sm object-cover"
						/>
						<div class="flex flex-1 flex-col gap-1 max-w-md">
							<p class="text-lg font-semibold">{badge.name}</p>
							<p>{badge.description}</p>
						</div>
						<div class="flex flex-1 flex-col gap-1 max-w-md">
							<p class="font-semibold mt-1">Requirements</p>
							<p>{badge.requirements}</p>
						</div>
					</div>
				{/each}
			</div>
		</article>
	</section>
	<section class="flex flex-col justify-center items-center w-full" id="Credits">
		<h1 class="text-center text-3xl mt-16 mb-8">Credits</h1>
		<article class="w-full max-w-4xl px-4">
			<div class="flex flex-col gap-2">
				{#each CREDITS as credit}
					<Card.Root class="flex-1 w-full">
						<Card.Header class="pb-4">
							<p class="text-xl font-semibold">{credit.name}</p>
						</Card.Header>
						<Card.Content>
							<div class="flex flex-col items-start">
								<p class="text-lg">{credit.role}</p>
								<div class="flex flex-row gap-4">
									{#each credit.links as link}
										<a class="text-lg my-3 underline" href={link.url}>{link.name}</a>
									{/each}
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</article>
	</section>
</main>
