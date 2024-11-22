<script lang="ts">
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import Head from '$comp/head.svelte';
</script>

<Head title="API Terms of Service" description="The TOS for using the Elite API" />

<main class="flex w-full flex-col items-center justify-center">
	<section class="flex w-full flex-col items-center justify-center">
		<article class="w-10/12 md:w-1/2">
			<h1 class="my-16 text-center text-3xl">Elite API Terms of Service</h1>
			<ExternalLinkButton href="https://api.elitebot.dev">Elite API Documentation</ExternalLinkButton>
			<div>
				<h2 class="text-semibold my-4 text-xl">Usage Restrictions</h2>
				<ul class="ml-4 flex flex-col gap-2">
					<li>
						<span class="select-none">• </span>Adhere to the
						<a class="underline" href="https://elitebot.dev/terms">Terms of Service</a>,
						<a class="underline" href="https://elitebot.dev/privacy">Privacy Policy</a>, and
						<a class="underline" href="https://developer.hypixel.net/policies/"
							>Hypixel's Developer Policies</a
						>
					</li>
					<li>
						<span class="select-none">• </span>Do not use the API for commercial purposes, any feature that
						uses the API should be free for all users.
					</li>
					<li>
						<span class="select-none">• </span>This API does not serve as a Hypixel API proxy. If your goal
						when using this API is to get Hypixel data, then you're not allowed to use it. This API is meant
						to be used for those looking to integrate farming weight into their own projects, or using
						endpoints that don't return player data.
					</li>
					<li>
						<span class="select-none">• </span>For any use of the API, you must credit https://elitebot.dev/
						on your website or application with a clear and clickable link present on every page/display
						that uses the API. If this is not possible, you can
						<a class="underline" href="https://elitebot.dev/contact">contact us</a> to discuss acceptable credit.
					</li>
					<li><span class="select-none">• </span>API access may be revoked at any time for any reason.</li>
					<li>
						<span class="select-none">• </span>Respect the rate limits. If you need more requests, you
						shouldn't be using the API. You're welcome to host your own instance of the API if you need more
						requests, but otherwise use Hypixel's API.
					</li>
					<li>
						<span class="select-none">• </span>The API should never be used purely as a Mojang API proxy. If
						you need to get a player's UUID, use the Mojang API.
					</li>
					<li>
						<span class="select-none">• </span>Do not use the API in a public project without permission
						from the Elite team. If you want to use the API in a public project,
						<a class="underline" href="https://elitebot.dev/contact">contact us</a>.
					</li>
				</ul>
			</div>
		</article>
	</section>
</main>
