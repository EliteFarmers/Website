<script lang="ts">
	import CropTable from './croptable.svelte';
	import BonusTable from './bonustable.svelte';
	import Head from '$comp/head.svelte';
</script>

<Head title="Information" description="View all information about the site and how farming weight is calculated." />

<main class="flex flex-col justify-center items-center w-full">
	<section class="flex flex-col justify-center items-center w-full">
		<h1 class="text-center text-3xl mt-16 mb-8">Weight Information</h1>
		<article class="w-10/12 md:w-1/2">
			<h2 class="text-2xl my-8">What is Farming Weight?</h2>
			<p class="text-lg my-4">
				Farming Weight is a number that essentially represents how long and how efficient a player has been
				farming. It is calculated by using a different formula for each crop that a player has farmed, and then
				adding them all together. Farming XP is not a factor in this calculation outside of one time bonus
				weight amounts. This is to ensure that players who farm using rabbit or who farm higher XP crops don't
				have an unfair advantage over players who farm using other methods.
			</p>
		</article>
		<article class="w-10/12 md:w-1/2">
			<h2 class="text-2xl my-8">Farming Weight Per Crop</h2>
			<p class="text-lg my-4">
				Each crop has a different weight. The weight of a crop is determined by the theoretical maximum amount
				of crops that can be farmed in the same timespan. The following table shows the amount of each crop
				needed to increase your farming weight by 1.
			</p>
			<CropTable />
			<p class="text-sm mt-4 mb-2">
				Base Drops Per Break refers to the average amount of drops you get from breaking a crop without any
				buffs. Sugar Cane and Cactus actually have a base drop of 1 per block, but because you can break 2
				blocks at once, 2 is noted here. Full calculation breakdowns will be added in the future.
			</p>
			<p class="text-sm">
				* Mushroom weight is calculated dynamically because of the Mooshroom Cow pet. Because Cactus and Sugar
				Cane are both 2 blocks per break, the cow's perk gives you twice the normal rate of mushroom drops than
				from other crops. To counter this, you get half the weight from mushrooms for the ratio of Cactus and
				Sugar Cane farmed out of the total weight, and the remainder is calculated normally.
			</p>
		</article>
	</section>
	<section class="flex flex-col justify-center items-center w-full">
		<h1 class="text-center text-3xl mt-16 mb-8">Bonus Weight</h1>
		<article class="w-10/12 md:w-1/2">
			<p class="text-lg my-4">
				There are a few sources of bonus weight that can be obtained. These are not intended to be a significant
				source of weight, but rather a small bonus to help players who are just starting out. As well as a fun
				way to get a little extra weight for completing different farming content in the game.
			</p>
			<BonusTable />
			<p class="text-sm my-4">More bonus weight sources may be added in the future.</p>
		</article>
	</section>
	<section class="flex flex-col justify-center items-center w-full">
		<h1 class="text-center text-3xl mt-16 mb-8">F.A.Q.</h1>
		<article class="w-10/12 md:w-1/2">
			<h2 class="text-2xl my-8">How do I verify my account?</h2>
			<p class="text-lg my-4">
				To verify your account, you must link your Minecraft account to your Discord account through Hypixel.
				There is a tutorial on how to do this on the <a class="underline" href="/profile">profile page</a> once you've
				logged in.
			</p>
		</article>
		<article class="w-10/12 md:w-1/2">
			<h2 class="text-2xl my-8">Why are there cheaters on the leaderboard?</h2>
			<p class="text-lg my-4">
				Unfortunately, it's hard to identify cheaters. The only way to do so is to manually check every player's
				farming habits and responsiveness in-game. This is a very time-consuming process, and isn't something
				that is conclusive. Despite this, cheaters will be removed from the leaderboard if they are found and
				reported with truly undeniable proof.
			</p>
		</article>
		<article class="w-10/12 md:w-1/2">
			<h2 class="text-2xl my-8">Are crop collections accurate?</h2>
			<p class="text-lg my-4">
				Yes! Hypixel seems to be counting the amount of farmed crops accurately, so the crop collections are
				accurate. However, that was not always the case. In the past, Hypixel has had issues with counting
				farmed crops when a player was in a shared island with another player. This has since been fixed as of
				November 2nd, 2021. Sadly, there is no way to add back the crops that were lost during this time as the
				amount lost differed wildly from player to player.
			</p>
		</article>
		<article class="w-10/12 md:w-1/2">
			<h2 class="text-2xl my-8">Why isn't farming XP counted?</h2>
			<p class="text-lg my-4">
				Farming XP is not counted because it is not a good representation of how much a player has farmed.
				Outside of one time bonus weight amounts (see above table), farming xp isn't considered. This is to
				ensure that players who farm using rabbit or who farm higher XP crops don't have an unfair advantage
				over players who farm using other methods. Farming Weight is meant to balance the skill and time taken
				to farm each crop.
			</p>
		</article>
		<article class="w-10/12 md:w-1/2">
			<h2 class="text-2xl my-8">Why is there an API disabled warning?</h2>
			<p class="text-lg my-4">
				In order for the site to see a player's data, the player must enable API access in their Skyblock
				settings. To do this, go to the Skyblock menu, and click the settings redstone torch button in the
				bottom row. Then, click the "API Settings" button and enable all API settings (do this for each of your
				profiles). This will allow the site to see your data. Only collections and skill APIs are used, but it
				is recommended to enable all APIs for credibility and future-proofing.
			</p>
		</article>
	</section>
	<section class="flex flex-col justify-center items-center w-full">
		<h1 class="text-center text-3xl mt-16 mb-8">Credits</h1>
		<article class="w-10/12 md:w-1/2">
			<p class="text-lg my-4">
				Website and Bot Maintained and Created by <a
					class="underline"
					rel="nofollow noreferrer noopener"
					href="/@7da0c47581dc42b4962118f8049147b7"
				>
					Kaeso</a
				>.
			</p>
			<p class="text-lg my-4">
				Original Weight Calculations and Max Farming Fortune Rates by <a
					class="underline"
					href="/@ac01147ed01a47d1b5777b31ccf5e616">Bankhier</a
				>.
			</p>
			<p class="text-lg my-4">
				Crop Icons by <a
					class="underline"
					rel="nofollow noreferrer noopener"
					href="https://www.etsy.com/listing/1499421785/pixelated-crop-stickers"
				>
					Lumini</a
				>.
			</p>
			<p class="text-lg my-4">
				Farming Tool textures from <a
					class="underline"
					rel="nofollow noreferrer noopener"
					href="https://hypixel.net/threads/4174260/">Hypixel+</a
				>
				by <a class="underline" rel="nofollow noreferrer noopener" href="https://ko-fi.com/ic22487">ic22487</a>.
			</p>
			<p class="text-lg my-4">
				Website logo by <a class="underline" href="ic22487">MelonKingDe</a>.
			</p>
			<p class="text-lg my-4">
				Minion Icons (and base API) from <a
					class="underline"
					rel="nofollow noreferrer noopener"
					href="https://hypixel.net/">Hypixel</a
				>.
			</p>
			<p class="text-lg my-4">
				Player models provided by <a
					class="underline"
					rel="nofollow noreferrer noopener"
					href="https://mc-heads.net/">MCHeads</a
				>.
			</p>
			<p class="text-lg my-4">
				Icons provided by <a
					class="underline"
					rel="nofollow noreferrer noopener"
					href="https://flowbite.com/icons/">Flowbite</a
				>.
			</p>
			<p class="text-lg my-4">
				Some inspiration from <a
					class="underline"
					rel="nofollow noreferrer noopener"
					href="https://github.com/SkyCryptWebsite/SkyCrypt">SkyCrypt</a
				>.
			</p>
			<p class="text-lg my-4">
				Feedback and support from the <a class="underline" rel="nofollow noreferrer noopener" href="/discord"
					>Elite Skyblock Farmers</a
				>.
			</p>
			<br /><br />
		</article>
	</section>
</main>
