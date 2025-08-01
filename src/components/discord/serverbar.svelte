<script lang="ts">
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import type { components } from '$lib/api/api';
	import Users from '@lucide/svelte/icons/users';

	interface Props {
		lazy?: boolean;
		guild: components['schemas']['GuildDetailsDto'];
	}

	let { lazy = true, guild }: Props = $props();
</script>

<a
	href="/server/{guild.id}"
	class="bg-card relative flex w-full flex-1 flex-row items-center justify-between overflow-clip rounded-lg p-8 py-8 {guild.banner
		? 'text-white'
		: ''}"
>
	{#if guild.banner?.url}
		<img
			class="pixelated absolute right-0 left-0 w-full rounded-lg"
			loading={lazy ? 'lazy' : 'eager'}
			src={guild.banner.url}
			alt="Server Banner"
		/>
		<div
			class="absolute top-0 right-0 bottom-0 left-0 rounded-lg bg-linear-to-r from-zinc-900/70 via-transparent to-zinc-900/70"
		></div>
	{/if}
	<div class="z-10 flex flex-row items-center gap-4">
		<GuildIcon {guild} size={16} />
		<h2 class="text-xl font-semibold sm:text-2xl md:text-3xl">{guild.name}</h2>
	</div>
	<div class="z-10 flex flex-row items-center gap-2 font-semibold">
		<p class="text-lg md:text-xl">
			{guild.memberCount?.toLocaleString()}
		</p>
		<Users />
	</div>
</a>
