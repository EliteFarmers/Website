<script lang="ts">
	import type { ProfileEventMemberDto } from '$lib/api';
	import * as Popover from '$ui/popover';

	interface Props {
		member: ProfileEventMemberDto;
		memberUuid: string;
		ign: string;
	}

	let { member, memberUuid, ign }: Props = $props();
</script>

<a
	class="bg-card flex w-full flex-row items-center justify-between gap-2 rounded-md px-6 py-[1.88rem]"
	href="/event/{member.eventId}/leaderboard#{memberUuid}"
>
	<div class="flex flex-row items-center justify-center gap-2 align-middle">
		<p class="text-lg">{member.eventName}</p>
		<Popover.Mobile>
			{#snippet trigger()}
				<div class="flex flex-col items-center justify-center">
					{#if member.status === 0}
						<div class="bg-muted h-2 w-2 rounded-full"></div>
					{/if}
					{#if member.status === 1}
						<div class="bg-progress h-2 w-2 rounded-full"></div>
					{/if}
				</div>
			{/snippet}
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
	<div class="flex flex-row items-center gap-4 pr-2 align-middle text-lg">
		{#if member.score && +member.score > 0}
			<p class="font-semibold">{(+(member.score ?? 0)).toLocaleString()}</p>
		{:else}
			<span class="text-destructive">Zero!</span>
		{/if}
	</div>
</a>
