<script lang="ts">
	import { PUBLIC_BOT_INVITE, PUBLIC_COMMUNITY_INVITE, PUBLIC_SUPPORT_SERVER_INVITE } from '$env/static/public';
</script>

<footer class="absolute w-full bottom-0 h-16">
	<div class="flex flex-col sm:flex-row gap-4 sm:gap-2 items-center justify-evenly py-4 bg-gray-100 dark:bg-zinc-800">
		<div class="flex flex-col text-sm underline justify-center items-center">
			<a class="hover:font-semibold" rel="nofollow noreferrer noopener" href={PUBLIC_BOT_INVITE}
				>Invite Elite Bot</a
			>
			<a class="hover:font-semibold" rel="nofollow noreferrer noopener" href={PUBLIC_COMMUNITY_INVITE}
				>Join Elite Farmers</a
			>
			<a class="hover:font-semibold" rel="nofollow noreferrer noopener" href={PUBLIC_SUPPORT_SERVER_INVITE}
				>Join Support Server</a
			>
		</div>
		<div class="flex flex-col items-center justify-center">
			<h1>
				Made by <a class="underline" href="/stats/7da0c47581dc42b4962118f8049147b7">Kaeso</a> |
				<a
					rel="nofollow noreferrer noopener"
					href="https://github.com/ptlthg/EliteWebsite/"
					class="underline hover:font-semibold">GitHub</a
				>
			</h1>
		</div>
	</div>
</footer>
