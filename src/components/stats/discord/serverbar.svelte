<script lang="ts">
	import type { components } from '$lib/api/api';
	import { UserGroupSolid } from 'flowbite-svelte-icons';

	export let guild: components['schemas']['GuildDetailsDto'];
</script>

<a
	href={`/server/${guild.id}`}
	class="relative flex flex-row justify-between flex-1 p-8 py-8 bg-cover bg-no-repeat bg-center rounded-lg w-full text-white bg-zinc-800"
	style={guild.banner
		? `background-image: url('https://cdn.discordapp.com/splashes/${guild.id}/${guild?.banner}.png?size=1280')`
		: ''}
>
	{#if guild.banner}
		<div
			class="absolute top-0 left-0 right-0 bottom-0 rounded-lg bg-gradient-to-r from-zinc-900/70 via-transparent to-zinc-900/70"
		/>
	{/if}
	<div class="flex flex-row gap-4 z-10 items-center">
		<img
			class="w-16 h-16"
			src="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.{guild.icon?.startsWith('a_')
				? 'gif'
				: 'webp'}"
			alt="Guild Icon"
			loading="lazy"
		/>
		<h2 class="text-3xl font-semibold">{guild.name}</h2>
	</div>
	<div class="flex flex-row gap-2 font-semibold items-center z-10">
		<p class="text-xl">
			{guild.memberCount?.toLocaleString()}
		</p>
		<UserGroupSolid size="lg" />
	</div>
</a>
