<script lang="ts">
	import type { AuthorizedUser } from '$lib/api/elite';
	import UserRound from '@lucide/svelte/icons/user-round';

	interface props {
		user: Partial<AuthorizedUser>;
		class?: string;
	}

	let { class: className = 'size-12', user }: props = $props();

	let errored = $state(false);
</script>

{#if !user.avatar || errored}
	<div class="{className} flex select-none items-center justify-center rounded-full bg-black bg-blend-darken">
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
		onerror={() => (errored = true)}
	/>
{/if}
