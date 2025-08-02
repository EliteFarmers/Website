<script lang="ts">
	import type { AuthorizedUser } from '$lib/api/elite';
	import UserRound from '@lucide/svelte/icons/user-round';

	type ValidSizes = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

	interface props {
		user: Partial<AuthorizedUser>;
		size?: ValidSizes;
		class?: string;
	}

	let { class: className = 'size-12', size = 128, user }: props = $props();

	let errored = $state(false);
</script>

{#if !user.avatar || errored}
	<div class="{className} flex items-center justify-center rounded-full bg-black bg-blend-darken select-none">
		<UserRound />
	</div>
{:else}
	<img
		loading="lazy"
		class="{className} rounded-full"
		src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.webp?size={size}&animated=true"
		alt="User Icon"
		onerror={() => (errored = true)}
	/>
{/if}
