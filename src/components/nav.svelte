<script lang="ts">
	import { session } from "$app/stores";

	$: discordUser = $session.discordUser;
</script>

<nav class="flex justify-between justify-items-center align-middle bg-gray-100 p-2">
	<section class="flex gap-2 mx-6 align-middle justify-items-center justify-end">
		<a class="p-3 hover:bg-gray-50" href="/">EliteDev</a>
		<a class="bg-gray-200 p-3 rounded-md hover:bg-gray-50" href="/profile">Profile</a>
	</section>
	<section class="flex gap-4 mx-6">
		<!-- Login with discord styled button -->
		<a sveltekit:reload class="bg-gray-200 p-3 rounded-md hover:bg-gray-50" href="/login" hidden={!!discordUser}>Login with Discord</a>
		<!-- Logout button -->
		<a sveltekit:reload class="bg-gray-200 p-3 rounded-md hover:bg-gray-50" href="/logout" hidden={discordUser === false}>Logout</a>
	</section>
</nav>
