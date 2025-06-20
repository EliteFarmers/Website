<script lang="ts">
	import CropTable from './croptable.svelte';
	import BonusTable from './bonustable.svelte';
	import Head from '$comp/head.svelte';
	import { CREDITS } from '$content/credits';
	import * as Card from '$ui/card';
	import { FAQ } from '$content/faq';
	import type { PageData } from './$types';
	import PestTable from './pest-table.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let weights = $derived(data.weights);
</script>

<Head title="Information" description="View all information about the site and how farming weight is calculated." />

<div class="flex w-full flex-col items-center justify-center">
	<section class="flex w-full flex-col items-center justify-center">
		<h1 class="mt-16 mb-8 text-center text-3xl">Weight Information</h1>
		<article class="w-full max-w-4xl px-4">
			<h2 class="my-8 text-2xl">What is Farming Weight?</h2>
			<p class="my-4 text-lg">
				Farming weight is a number that essentially represents how long and how efficient a player has been
				farming. The basic idea is to balance the collection between crops, so one player's crop collection can
				be compared with another players collection of a different crop. The focus on crop collections means
				that Farming XP is not a factor in this calculation outside of one time bonus weight amounts. This is to
				ensure that players who farm for XP crops don't have an unfair advantage in farming weight gain over
				players who farm using other methods.
			</p>
		</article>
		<article class="w-full max-w-4xl px-4">
			<h2 class="my-8 text-2xl">Farming Weight Per Crop</h2>
			<p class="my-4 text-lg">
				Each crop has a different weight. The weight of a crop is determined by the theoretical maximum amount
				of crops that can be farmed in the same timespan. The following table shows the amount of each crop
				needed to increase your farming weight by 1.
			</p>
			<CropTable {weights} />
			<p class="mt-4 mb-2 text-sm">
				Base Drops Per Break refers to the average amount of drops you get from breaking a crop without any
				buffs. Sugar Cane and Cactus actually have a base drop of 1 per block, but because you can break 2
				blocks at once, 2 is noted here. Full calculation breakdowns will be added in the future.
			</p>
			<p class="mb-4 text-sm">
				* Mushroom weight is calculated dynamically because of the Mooshroom Cow pet. Because Cactus and Sugar
				Cane are both 2 blocks per break, the cow's perk gives you twice the normal rate of mushroom drops than
				from other crops. To counter this, you get half the weight from mushrooms for the ratio of Cactus and
				Sugar Cane farmed out of the total weight, and the remainder is calculated normally.
			</p>
		</article>
	</section>
	<section class="flex w-full flex-col items-center justify-center" id="Pests">
		<h1 class="mt-16 mb-8 text-center text-3xl">Pest Weight Adjustment</h1>
		<p class="my-4 w-full max-w-4xl px-4 text-lg">
			The introduction of pests to the garden has brought a new (and unreliable) source of crop collection into
			the game which needs to be accounted for in farming weight. If pest drops were balanced in-game there would
			be no issue with them counting towards farming weight, but they aren't. To counteract this unbalance, the
			weight calculation subtracts an averaged amount of crop collections per pest kill before applying the
			formula. The subtracted amount is also in brackets as shown below to compensate for fortune differences.
			Your collection numbers on the site are still accurate, this subtraction is just done internally during the
			farming weight calculation.
		</p>
		<article class="w-full max-w-4xl px-4">
			<h2 class="my-8 text-2xl">Pest Brackets</h2>
			<p class="my-4 text-lg">
				The following table shows the amount of collection per crop that is subtracted based on the number of
				pests you have killed. The amounts are calculated in brackets, with an associated farming fortune noted
				that was used to calculate your average drops per pest kill.
			</p>
			<PestTable {weights} />
			<p class="mt-4 mb-2 text-sm">
				This system is progressive, which means that as you hit the next bracket, the previous bracket's pest
				amounts are still using their associated bracket's fortune values.
			</p>
		</article>
	</section>
	<section class="flex w-full flex-col items-center justify-center">
		<h1 class="mt-16 mb-8 text-center text-3xl">Bonus Weight</h1>
		<article class="w-full max-w-4xl px-4">
			<p class="my-4 text-lg">
				There are a few sources of bonus weight that can be obtained. These are not intended to be a significant
				source of weight, but rather a small bonus to help players who are just starting out. As well as a fun
				way to get a little extra weight for completing different farming content in the game.
			</p>
			<BonusTable />
			<p class="my-4 text-sm">More bonus weight sources may be added in the future.</p>
		</article>
	</section>
	<section class="flex w-full flex-col items-center justify-center" id="FAQ">
		<h1 class="mt-16 mb-8 text-center text-3xl">F.A.Q.</h1>
		{#each FAQ as faq, i (i)}
			<article class="w-full max-w-4xl px-4">
				<h2 class="my-8 text-2xl">{faq.question}</h2>
				<p class="my-4 text-lg">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html faq.answer}
				</p>
			</article>
		{/each}
	</section>
	<section class="flex w-full flex-col items-center justify-center" id="Badges">
		<h1 class="mt-16 mb-8 text-center text-3xl">Badges</h1>
		<article class="w-full max-w-4xl px-4">
			<p class="text-lg">
				Badges are cosmetic profile decorations players can display on the website. More may be added at any
				time, and they are configurable in your account settings.
			</p>
			<div class="flex flex-col gap-4">
				<h3 class="mt-4 text-2xl">List of Badges</h3>
				{#each data?.badges ?? [] as badge, i (i)}
					<div class="flex flex-row items-center gap-4">
						{#if badge.image?.url}
							<img
								src={badge.image.url}
								alt={badge.name}
								class="h-6 w-18 rounded-sm object-cover md:h-8 md:w-24"
							/>
						{/if}
						<div class="flex max-w-md flex-1 flex-col gap-1">
							<p class="text-lg font-semibold">{badge.name}</p>
							<p>{badge.description}</p>
						</div>
						<div class="flex max-w-md flex-1 flex-col gap-1">
							<p class="mt-1 font-semibold">Requirements</p>
							<p>{badge.requirements}</p>
						</div>
					</div>
				{/each}
			</div>
		</article>
	</section>
	<section class="flex w-full flex-col items-center justify-center" id="Credits">
		<h1 class="mt-16 mb-8 text-center text-3xl">Credits</h1>
		<article class="w-full max-w-4xl px-4">
			<div class="flex flex-col gap-2">
				{#each CREDITS as credit, i (i)}
					<Card.Root class="w-full flex-1">
						<Card.Header class="pb-4">
							<p class="text-xl font-semibold">{credit.name}</p>
						</Card.Header>
						<Card.Content>
							<div class="flex flex-col items-start">
								<p class="text-lg">{credit.role}</p>
								<div class="flex flex-row gap-4">
									{#each credit.links as link, i (i)}
										<a class="my-3 text-lg underline" href={link.url}>{link.name}</a>
									{/each}
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</article>
	</section>
</div>
