<script lang="ts">
	import { goto, invalidate } from "$app/navigation";
	import type { DiscordUser } from "$db/models/users";
	import { page } from "$app/stores";

	export let discordUser: DiscordUser | false;

	let searchVal = '';

	async function search() {
		const isAtStats = $page.url.pathname.startsWith('/stats');

		await goto(`/stats/${searchVal}`);

		if (isAtStats) {
			location.reload();
		}
	}
</script>

<nav class="flex justify-between justify-items-center bg-gray-100 p-2">
	<section class="flex gap-2 mr-3 justify-start w-1/4">
		<a class="p-3 hover:bg-gray-50" href="/">EliteDev</a>
		<a class="bg-gray-200 p-3 rounded-md hover:bg-gray-50" href="/profile">Profile</a>
	</section>
	<!-- Section that's centered in the nav bar -->
	<section class="flex gap-2 mx-6 justify-items-center justify-center w-1/2">
		<form class="m-0 p-0 w-[100%]" on:submit|preventDefault>
			<input class="w-5/6 bg-gray-200 p-3 rounded-md hover:bg-gray-50" type="text" placeholder="Search" bind:value={searchVal} />
			<button class="bg-gray-200 p-3 rounded-md hover:bg-gray-50" on:click={search}>
				<svg class="h-4 w-4" viewBox="0 0 24 24">
					<path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
				</svg>
			</button>
		</form>
	</section>
	<section class="flex gap-2 ml-3 justify-end w-1/4">
		<!-- Login with discord styled button -->
		<a sveltekit:reload class="bg-gray-200 p-3 rounded-md hover:bg-gray-50" href="/login" hidden={discordUser !== false}>Login with Discord</a>
		<!-- Logout button -->
		<a sveltekit:reload class="bg-gray-200 p-3 rounded-md hover:bg-gray-50" href="/logout" hidden={discordUser === false}>Logout</a>
	</section>
</nav>
