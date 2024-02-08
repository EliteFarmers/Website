<script lang="ts">
	import type { AuthorizedUser } from '$lib/api/elite';
	import { UserRound } from 'lucide-svelte/icons';
	export let user: AuthorizedUser;
	export let size = 12;
</script>

{#if !user.avatar}
	<div class="w-{size} h-{size} rounded-full flex items-center justify-center select-none bg-blend-darken bg-black">
		<UserRound />
	</div>
{:else}
	<img
		loading="lazy"
		class="w-{size} h-{size} rounded-full"
		src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${
			user.avatar.startsWith('a_') ? 'gif' : 'webp'
		}?size=96`}
		alt="User Icon"
	/>
{/if}
