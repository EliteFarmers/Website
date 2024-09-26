interface Faq {
	question: string;
	answer: string;
}

export const FAQ: Faq[] = [
	{
		question: 'How do I verify my account?',
		answer: `
			To verify your account, you must link your Minecraft account to your Discord account through Hypixel.
			There is a tutorial on how to do this on the <a class="underline" href="/profile">profile page</a> once you've
			logged in.
		`,
	},
	{
		question: 'Why are there cheaters on the leaderboard?',
		answer: `
			Unfortunately, it's hard to identify cheaters. This website does not work as an authority on who is
			cheating and who is not. Some features are also intended to be a direct representation of in-game stats
			as well, like Jacob contest placements. It's possible a blacklisting system will be implemented in the 
			future for the main leaderboards, but for now, we have no intention or system in place to flag and remove
			cheaters. If you suspect someone is cheating, please report them to Hypixel using the /wdr command in-game. 
		`,
	},
	{
		question: 'How do I get on a leaderboard?',
		answer: `
			Once your stats qualify for a leaderboard placement, you will be automatically added to it! New entries to
			leaderboards are only calculated every 30 minutes, so you may not see yourself on the leaderboard immediately 
			after you qualify.
		`,
	},
	{
		question: 'Are crop collections accurate?',
		answer: `
			Yes! Hypixel seems to be counting the amount of farmed crops accurately, so the crop collections are
			accurate. However, that was not always the case. In the past, Hypixel has had issues with counting
			farmed crops when a player was in a shared island with another player. This has since been fixed as of
			November 2nd, 2021. Sadly, there is no way to add back the crops that were lost during this time as the
			amount lost differed wildly from player to player.
		`,
	},
	{
		question: "Why isn't farming XP counted?",
		answer: `
			Farming XP is not counted because it is not a good representation of how much a player has farmed.
			Outside of one time bonus weight amounts (see above table), farming xp isn't considered. This is to
			ensure that players who farm using rabbit or who farm higher XP crops don't have an unfair advantage
			over players who farm using other methods. Farming Weight is meant to balance the skill and time taken
			to farm each crop.
		`,
	},
	{
		question: 'Why is there an API disabled warning?',
		answer: `
			In order for the site to see a player's data, the player must enable API access in their Skyblock
			settings. To do this, go to the Skyblock menu, and click the settings redstone torch button in the 
			bottom row. Then, click the "API Settings" button and enable all API settings (do this for each of 
			your profiles). This will allow the site to see your data. Only collections and skill APIs are used, 
			but it is recommended to enable all APIs for credibility and future-proofing.
		`,
	},
];
