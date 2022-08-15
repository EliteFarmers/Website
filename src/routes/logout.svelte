<script lang="ts" context="module">
	import type { Load } from './__types/logout';
	import { browser } from "$app/env";
	import { session } from "$app/stores";

	export const load: Load = async ({ fetch }) => {
		await fetch('/api/signout');

		if (browser) session.set({ user: false, discordUser: false });

		return {
			status: 302,
			redirect: '/',
		};
	}
</script>