<script lang="ts">
	import UserIcon from '$comp/discord/user-icon.svelte';
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import * as Item from '$ui/item/index.js';

	const context = getRecapContext();
	let data = $derived(context.data);
	let discord = $derived(context.current?.discord);
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-violet-950 to-black p-4 md:p-8"
>
	<h1 class="animate-fade-in-up mb-8 text-center text-4xl font-black text-white drop-shadow-lg md:mb-12 md:text-7xl">
		<span class="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{context.year}</span>
		<br />
		<span class="text-white">Farming Recap</span>
	</h1>

	<div class="animate-scale-in relative mb-8 h-48 w-48 drop-shadow-2xl md:mb-12 md:h-64 md:w-64">
		<img
			src="https://skins.mcstats.com/body/front/{data.player.uuid}"
			alt={data.player.ign}
			class="h-full w-full object-contain"
		/>
	</div>

	<h2 class="animate-fade-in mb-6 text-2xl font-bold text-white md:mb-8 md:text-4xl">{data.player.ign}</h2>

	{#if discord?.username}
		<div class="animate-fade-in delay-200">
			<Item.Root variant="outline" class="items-center border-white/10 bg-white/5 pr-4 backdrop-blur-md md:pr-6">
				<Item.Media>
					<UserIcon user={discord} class="size-10 rounded-full md:size-12" />
				</Item.Media>
				<Item.Content>
					<Item.Title class="text-base font-bold text-white md:text-lg">{discord.username}</Item.Title>
					<Item.Description class="text-xs text-zinc-400 md:text-sm">Linked Discord Account</Item.Description>
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
