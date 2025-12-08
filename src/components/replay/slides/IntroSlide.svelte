<script lang="ts">
	import UserIcon from '$comp/discord/user-icon.svelte';
	import type { YearlyRecapData, YearlyRecapDto } from '$lib/api/schemas';
	import * as Item from '$ui/item/index.js';

	interface Props {
		data: YearlyRecapData;
		discord?: YearlyRecapDto['discord'];
	}

	let { data, discord }: Props = $props();
</script>

<div class="flex h-full w-full flex-col items-center justify-center bg-linear-to-b from-violet-950 to-black p-8">
	<h1 class="animate-fade-in-up mb-12 text-center text-5xl font-black text-white drop-shadow-lg md:text-7xl">
		<span class="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{data.year}</span>
		<br />
		<span class="text-white">Farming Recap</span>
	</h1>

	<div class="animate-scale-in relative mb-12 h-64 w-64 drop-shadow-2xl">
		<img
			src="https://mc-heads.net/body/{data.player.uuid}"
			alt={data.player.ign}
			class="h-full w-full object-contain"
		/>
	</div>

	<h2 class="animate-fade-in mb-8 text-4xl font-bold text-white">{data.player.ign}</h2>

	{#if discord?.username}
		<div class="animate-fade-in delay-200">
			<Item.Root variant="outline" class="items-center border-white/10 bg-white/5 pr-6 backdrop-blur-md">
				<Item.Media>
					<UserIcon user={discord} class="size-12 rounded-full" />
				</Item.Media>
				<Item.Content>
					<Item.Title class="text-lg font-bold text-white">{discord.username}</Item.Title>
					<Item.Description class="text-sm text-zinc-400">Linked Discord Account</Item.Description>
				</Item.Content>
			</Item.Root>
		</div>
	{/if}
</div>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in-up {
		animation: fade-in-up 1s ease-out forwards;
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.animate-scale-in {
		animation: scale-in 0.8s ease-out 0.3s forwards;
		opacity: 0; /* Start hidden */
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.animate-fade-in {
		animation: fade-in 1s ease-out forwards;
		opacity: 0;
	}
	.delay-200 {
		animation-delay: 0.2s;
		animation-fill-mode: forwards;
	}
</style>
