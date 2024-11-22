<script lang="ts">
	import * as Popover from '$comp/ui/popover';
	import { EventType } from '$lib/utils';

	interface Props {
		type: number;
	}

	let { type }: Props = $props();
</script>

<Popover.Mobile class="text-black dark:text-white">
	{#snippet trigger()}
		<div class="flex w-fit flex-row items-center gap-2 rounded-sm bg-card p-1 px-2 font-semibold leading-none">
			{#if type === +EventType.FarmingWeight}
				<img src="/favicon.webp" alt="Farming Weight" class="h-4 w-4" />
				<p class="text-xs sm:text-sm">Farming Weight Event</p>
			{:else if type === +EventType.Medals}
				<img src="/images/medals/diamond.webp" alt="Farming Weight" class="h-4 w-4" />
				<p class="text-xs sm:text-sm">Jacob Contest Event</p>
			{/if}
		</div>
	{/snippet}
	<div>
		{#if type === +EventType.FarmingWeight}
			<p class="text-lg font-semibold">Farming Weight Event</p>
			<p class="max-w-xs">Earn points for gaining farming weight during the event!</p>
		{:else if type === +EventType.Medals}
			<p class="text-lg font-semibold">Jacob Contests Event</p>
			<p class="max-w-xs">Earn points for each Jacob contest placement you earn during the event!</p>
		{/if}
	</div>
</Popover.Mobile>
