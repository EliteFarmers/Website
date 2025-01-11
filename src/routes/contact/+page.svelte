<script lang="ts">
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import Head from '$comp/head.svelte';
</script>

<Head title="Contact Us" description="How to contact the Elite team." />

<div class="flex w-full flex-col items-center justify-center">
	<section class="flex w-full flex-col items-center justify-center">
		<article class="w-10/12 md:w-1/2">
			<h1 class="my-16 text-center text-3xl">Contact Us</h1>
			<div class="mb-8">
				<h2 class="text-semibold my-4 text-xl">Report Bugs / Make Suggestions</h2>
				<p>
					Please report any bugs or make suggestions on the <ExternalLinkButton
						href="/support"
						text="support Discord server"
					/>. You may also use the <ExternalLinkButton
						href="https://github.com/EliteFarmers/Website"
						text="GitHub repository"
					/> to report bugs, but the Discord server is preferred.
				</p>
			</div>
			<div class="mb-8">
				<h2 class="text-semibold my-4 text-xl">Appeal a ban on The Elite Skyblock Farmers</h2>
				<p>
					This is not the place to appeal a ban on the Elite Farmers server. The Elite Skyblock Farmers has no
					ban appeal system at this time, and trying to contact us about a ban will not result in any action
					being taken.
				</p>
			</div>
			<div class="mb-8">
				<h2 class="text-semibold my-4 text-xl">Questions about farming or Hypixel</h2>
				<p>
					You can ask questions about farming or Hypixel in the community Discord server, <ExternalLinkButton
						href="https://elitebot.dev/discord"
						text="The Elite Skyblock Farmers"
					/>. Do not contact us directly with questions like these.
				</p>
			</div>
			<div class="mb-8">
				<h2 class="text-semibold my-4 text-xl">Email Contact</h2>
				<p>
					For business or legal inquiries, please email <ExternalLinkButton
						href="mailto:contact@elitebot.dev"
						text="contact@elitebot.dev"
						icon={false}
					/>. Any other inquiries may be ignored, and should instead be directed to the <ExternalLinkButton
						href="/support"
						text="support Discord server"
					/>.
				</p>
			</div>
		</article>
	</section>
</div>
