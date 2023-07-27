<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button, Card } from 'flowbite-svelte';
	import { GearSolid } from 'flowbite-svelte-icons';

	export let guild: components['schemas']['UserGuildDto'];
</script>

<Card class="m-1 p-4 inline-block bg-gray-200 dark:bg-zinc-800" color="none" border={false}>
	<div class="flex justify-between items-center">
		<div class="flex flex-shrink min-w-0 justify-start items-center gap-4">
			{#if guild.icon == null}
				<div
					class="w-12 h-12 flex items-center justify-center select-none bg-blend-darken bg-black rounded-full"
				>
					<h1>
						{guild.name
							?.split(' ')
							.slice(0, 3)
							.map((word) => word[0])
							.join('')}
					</h1>
				</div>
			{:else}
				<img
					loading="lazy"
					class="w-12 h-12 rounded-full"
					src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`}
					alt="Server Icon"
				/>
			{/if}
			<h1 class="text-xl overflow-hidden whitespace-nowrap text-ellipsis pr-4">{guild.name}</h1>
		</div>
		<div class="flex justify-end min-w-0 items-center gap-4">
			{#if guild.hasBot}
				<Button href={`/guild/${guild.id}`} variant="raised" class="m-1">
					<GearSolid />
				</Button>
			{:else}
				<Button href={`/invite?guild_id=${guild.id}`} variant="outlined" class="m-1">
					<p>Invite</p>
				</Button>
			{/if}
		</div>
	</div>
</Card>
