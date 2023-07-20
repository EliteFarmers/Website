<script lang="ts">
	import Head from '$comp/head.svelte';
</script>

<Head title="API Terms of Service" description="The TOS for using the Elite API" />

<main class="flex flex-col justify-center items-center w-full">
	<section class="flex flex-col justify-center items-center w-full">
		<article class="w-10/12 md:w-1/2">
			<h1 class="text-center text-3xl mt-16 mb-8">API Terms of Service</h1>
			<ol class="tezt-lg flex flex-col gap-2">
				<li>
					1. Follow <a class="underline" href="https://developer.hypixel.net/policies/"
						>Hypixel's Developer Policies</a
					>
				</li>
				<li>2. Do not use the API for commercial or illegal purposes</li>
				<li>
					3. For any use of the API, you must credit https://elitebot.dev/ on your website or application with
					a clear and clickable link present on every page/display that uses the API (if within reason)
				</li>
				<li>4. API access may be revoked at any time for any reason</li>
				<li>
					5. Respect the rate limits. If you need more requests, you shouldn't be using the API. You're
					welcome to host your own instance of the API if you need more requests, but otherwise use Hypixel's
					API
				</li>
				<li>
					6. The API should never be used purely as a Mojang API proxy. If you need to get a player's UUID,
					use the Mojang API
				</li>
				<li>
					7. Do not use the API in a public project without permission from the Elite team. If you want to use
					the API in a public project, contact us on Discord
				</li>
			</ol>
		</article>
	</section>
</main>
