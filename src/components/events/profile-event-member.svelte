<script lang="ts">
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';

	export let member: components['schemas']['ProfileEventMemberDto'];
	export let ign: string;
</script>

<a
	class="flex flex-row justify-between items-center w-full px-6 py-[1.88rem] gap-2 rounded-md bg-primary-foreground"
	href="/event/{member.eventId}"
>
	<div class="flex flex-row gap-2 align-middle items-center justify-center">
		<p class="text-lg">{member.eventName}</p>
		<Popover.Mobile>
			<div slot="trigger">
				<div class="flex flex-col items-center justify-center">
					{#if member.status === 0}
						<div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-700" />
					{/if}
					{#if member.status === 1}
						<div class="w-2 h-2 rounded-full bg-green-500 dark:bg-green-300" />
					{/if}
				</div>
			</div>
			<div>
				{#if member.status === 0}
					<p class="text-lg font-semibold">Inactive Farmer</p>
					<p class="max-w-xs">
						{ign} has not increased their score since last checked.
					</p>
				{/if}
				{#if member.status === 1}
					<p class="text-lg font-semibold">Actively Farming!</p>
					<p class="max-w-xs">{ign} has increased their score since last checked!</p>
				{/if}
			</div>
		</Popover.Mobile>
	</div>
	<div class="flex flex-row align-middle text-lg pr-2 items-center gap-4">
		{#if member.score && +member.score > 0}
			<p class="font-semibold">{(+(member.score ?? 0)).toLocaleString()}</p>
		{:else}
			<span class="text-red-800 dark:text-red-500">Zero!</span>
		{/if}
	</div>
</a>
