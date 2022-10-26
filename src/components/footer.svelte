<script lang="ts">
	import { PUBLIC_BOT_INVITE, PUBLIC_COMMUNITY_INVITE, PUBLIC_SUPPORT_SERVER_INVITE } from '$env/static/public';
	import { swapTheme } from '$stores/themeStore';
</script>

<footer class="absolute w-full bottom-0 h-16">
	<div class="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-evenly py-4 bg-gray-100 dark:bg-zinc-800">
		<div class="flex flex-col text-sm underline justify-center items-center">
			<a class="hover:font-semibold" href={PUBLIC_BOT_INVITE}>Invite Elite Bot</a>
			<a class="hover:font-semibold" href={PUBLIC_COMMUNITY_INVITE}>Join Elite Farmers</a>
			<a class="hover:font-semibold" href={PUBLIC_SUPPORT_SERVER_INVITE}>Join Support Server</a>
		</div>
		<div class="flex flex-col items-center justify-center">
			<h1>
				Made by Kaeso |
				<a href="https://github.com/ptlthg/EliteWebsite/" class="underline hover:font-semibold">GitHub</a>
			</h1>
		</div>
		<div class="flex flex-col items-center justify-center">
			<button class="bg-gray-200 dark:bg-zinc-700 p-4 rounded-lg" on:click={() => swapTheme()}
				>Toggle Theme</button
			>
		</div>
	</div>
</footer>
