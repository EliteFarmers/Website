<script lang="ts">
	import type { components } from '$lib/api/api';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';
	import Users from 'lucide-svelte/icons/users';

	export let guild: components['schemas']['GuildDetailsDto'];
</script>

<a
	href="/server/{guild.id}"
	class="relative flex flex-row justify-between flex-1 p-8 py-8 rounded-lg w-full items-center bg-primary-foreground overflow-clip {guild.banner
		? 'text-white'
		: ''}"
>
	{#if guild.banner}
		<img
			class="absolute left-0 right-0 rounded-lg w-full pixelated"
			loading="lazy"
			src="https://cdn.discordapp.com/splashes/{guild.id}/{guild?.banner}.png?size=640"
			alt="Server Banner"
		/>
		<div
			class="absolute top-0 left-0 right-0 bottom-0 rounded-lg bg-gradient-to-r from-zinc-900/70 via-transparent to-zinc-900/70"
		/>
	{/if}
	<div class="flex flex-row gap-4 z-10 items-center">
		<Guildicon {guild} size={16} />
		<h2 class="text-xl sm:text-2xl md:text-3xl font-semibold">{guild.name}</h2>
	</div>
	<div class="flex flex-row gap-2 font-semibold items-center z-10">
		<p class="text-lg md:text-xl">
			{guild.memberCount?.toLocaleString()}
		</p>
		<Users />
	</div>
</a>
