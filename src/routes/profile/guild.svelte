<script lang="ts">
	import type { Guild } from "$lib/discord";
	import Card from "@smui/card";
	import Button from "@smui/button";

	export let guild: Guild;
</script>

<Card class="m-1 p-4 inline-block">
	<div class="flex justify-between items-center">
		<div class="flex justify-start items-center gap-4">
			{#if guild.icon == null}
				<div class="w-12 h-12 flex items-center justify-center select-none bg-blend-darken bg-black rounded-full">
					<h1>{guild.name.split(' ').slice(0, 3).map(word => word[0]).join('')}</h1>
				</div>
			{:else}
				<img 
					loading="lazy" 
					class="w-12 h-12 rounded-full" 
					src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`} 
					alt="Server Icon"
				>
			{/if}
			<h1 class="text-xl overflow-hidden whitespace-nowrap text-ellipsis">{guild.name}</h1>
		</div>
		<Button
			href={`/guild/${guild.id}`}
			variant="raised"
			class="m-1"
		>
			<p>Manage</p>
		</Button>
	</div>
</Card>