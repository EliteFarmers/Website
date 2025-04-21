<script lang="ts">
	import * as Popover from '$comp/ui/popover';
	import { EventType } from '$lib/utils';
	import ShoppingBasket from '@lucide/svelte/icons/shopping-basket';

	interface Props {
		type: number;
		popover?: boolean;
	}

	let { type, popover = true }: Props = $props();
</script>

{#snippet triggerContent()}
	<div
		class="flex w-fit flex-row items-center gap-2 rounded-sm bg-primary p-1 px-2 font-semibold leading-none text-primary-foreground"
	>
		{#if type === +EventType.FarmingWeight}
			<img src="/favicon.webp" alt="Farming Weight" class="size-4" />
			<p class="text-xs sm:text-sm">Farming Weight Event</p>
		{:else if type === +EventType.Medals}
			<img src="/images/medals/diamond.webp" alt="Farming Weight" class="size-4" />
			<p class="text-xs sm:text-sm">Jacob Contest Event</p>
		{:else if type === +EventType.Pests}
			<img src="/images/pests/mouse.png" alt="Mouse" class="size-4" />
			<p class="text-xs sm:text-sm">Pest Event</p>
		{:else if type === +EventType.Collections}
			<ShoppingBasket class="size-4" />
			<p class="text-xs sm:text-sm">Collection Event</p>
		{/if}
	</div>
{/snippet}

{#if popover}
	<Popover.Mobile>
		{#snippet trigger()}
			{@render triggerContent()}
		{/snippet}
		<div>
			{#if type === +EventType.FarmingWeight}
				<p class="text-md mb-1 font-semibold">Farming Weight Event</p>
				<p class="max-w-xs">Earn points for gaining farming weight during the event!</p>
			{:else if type === +EventType.Medals}
				<p class="text-md mb-1 font-semibold">Jacob Contests Event</p>
				<p class="max-w-xs">Earn points for each Jacob contest placement you earn during the event!</p>
			{:else if type === +EventType.Pests}
				<p class="text-md mb-1 font-semibold">Pest Event</p>
				<p class="max-w-xs">Earn points for each pest you kill during the event!</p>
			{:else if type === +EventType.Collections}
				<p class="text-md mb-1 font-semibold">Collection Event</p>
				<p class="max-w-xs">Earn points for collecting specific items during the event!</p>
			{/if}
		</div>
	</Popover.Mobile>
{:else}
	{@render triggerContent()}
{/if}
