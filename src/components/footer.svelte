<script lang="ts">
	import { swapTheme } from '$stores/themeStore';
</script>

<footer class="absolute w-full bottom-0 h-16">
	<div class="block sm:flex flex-row items-center justify-evenly py-4 bg-gray-100 dark:bg-zinc-800">
		<div class="flex flex-col items-center justify-center">
			<h1>
				Made by Kaeso |
				<a href="https://github.com/ptlthg/EliteWebsite/" class="text-blue-600">GitHub</a>
			</h1>
		</div>
		<div class="flex flex-col items-center justify-center">
			<button class="bg-gray-200 dark:bg-zinc-700 p-4 rounded-lg" on:click={() => swapTheme()}
				>Toggle Theme</button
			>
		</div>
	</div>
</footer>
