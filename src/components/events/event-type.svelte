<script lang="ts">
	import * as Popover from "$comp/ui/popover";
	import { EventType } from "$lib/utils";

	export let type: number;
</script>

<Popover.Mobile>
	<div slot="trigger" class="flex flex-row gap-2 items-center bg-card rounded-sm p-1 px-2 w-fit font-semibold leading-none">
		{#if type === +EventType.FarmingWeight}
			<img src="/favicon.webp" alt="Farming Weight" class="w-4 h-4" />
			<p class="text-sm">Farming Weight Event</p>
		{:else if type === +EventType.Medals}
			<img src="/images/medals/diamond.webp" alt="Farming Weight" class="w-4 h-4" />
			<p class="text-sm">Jacob Contest Event</p>
		{/if}
	</div>
	<div>
		{#if type === +EventType.FarmingWeight}
			<p class="text-lg font-semibold">Farming Weight Event</p>
			<p class="max-w-xs">
				Earn points for gaining farming weight during the event!
			</p>
		{:else if type === +EventType.Medals}
			<p class="text-lg font-semibold">Jacob Contests Event</p>
			<p class="max-w-xs">
				Earn points for each Jacob contest placement you earn during the event!
			</p>
		{/if}
	</div>
</Popover.Mobile>
