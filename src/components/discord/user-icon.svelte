<script lang="ts">
	import type { AuthorizedUser } from '$lib/api/elite';
	import UserRound from 'lucide-svelte/icons/user-round';

	interface props {
		user: AuthorizedUser;
		class?: string;
	}
	
	let { class: className = 'size-12', user }: props = $props(); 
</script>

{#if !user.avatar}
	<div class="{className} rounded-full flex items-center justify-center select-none bg-blend-darken bg-black">
		<UserRound />
	</div>
{:else}
	<img
		loading="lazy"
		class="{className} rounded-full"
		src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.{user.avatar.startsWith('a_')
			? 'gif'
			: 'webp'}?size=96"
		alt="User Icon"
	/>
{/if}
