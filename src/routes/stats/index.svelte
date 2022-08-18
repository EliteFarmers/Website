<script context="module" lang="ts">
	import type { AccountInfo, Profiles } from '$lib/skyblock';
	import type { Load } from './__types/index';

	export const load: Load = async ({ session }) => {

		if (session.user) {
			return {
				status: 302,
				redirect: `/stats/${session.user.ign}`,
			};
		}

		return {
			status: 302,
			redirect: '/',
		}
	}
</script>