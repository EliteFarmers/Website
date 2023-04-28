<script lang="ts">
	const start = new Date(1681395300000);
	const now = new Date();
	const diff = now.getTime() - start.getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	const rtf = new Intl.RelativeTimeFormat('en', {
		localeMatcher: 'best fit',
		numeric: 'always',
		style: 'long',
	});
</script>

<section class="flex justify-center align-middle py-8">
	<div
		class="border-4 rounded-lg border-red-400 w-[95%] lg:w-[80%] xl:w-[70%] bg-red-300 dark:border-red-800 dark:bg-red-900 text-center p-3"
	>
		<h1 class="text-2xl pb-2">Please Help - Discord Suspended the Elite Farmer's Server</h1>
		<p>
			{rtf.format(-days, 'days')}, the staff members of The Elite Skyblock farmers woke up to see the server gone
			and our accounts disabled. We allegedly broke TOS because of "malicious hacking, and/or credit card scams"
			in a Skyblock Farming related discord. This is obviously untrue. All of our support tickets have been closed
			twice without receiving any reply or justification. Please
			<a href="https://twitter.com/Ptlthg/status/1651949994906116096" class="text-blue-400 underline"
				>retweet and like this post to help us</a
			>, any engagement is appreciated. (Sorry, I hate Twitter too)
		</p>
	</div>
</section>
