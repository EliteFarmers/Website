<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Popover from '$ui/popover';
	import DiscordIcon from './discord-icon.svelte';
	import Check from '@lucide/svelte/icons/check';
	import CircleX from '@lucide/svelte/icons/circle-x';

	const ctx = getStatsContext();
	const linked = $derived((ctx.account.discordUsername?.length ?? 0) > 0);
	const username = $derived(ctx.account.discordUsername ?? ctx.account.playerData?.socialMedia?.discord ?? null);

	let isValidName = $derived.by(() => {
		// Less strict check for old usernames with #
		if (username?.includes('#')) {
			return !username.includes('://') && !username.includes('discord');
		} else {
			// Check if name has anything other than letters, numbers, underscores, and periods
			const regex = /[^a-zA-Z0-9_.#]/g;
			return !(username && regex.test(username));
		}
	});
</script>

<Popover.Mobile
	triggerClass="relative flex max-w-fit flex-row items-center justify-between gap-1 rounded-md border p-2 px-3 text-lg @md:p-3"
>
	{#snippet trigger()}
		<div class="block max-w-fit rounded-md" id="discordId">
			<div class="flex flex-row items-center gap-2">
				<span class="mt-1 h-5 w-5">
					<DiscordIcon />
				</span>
				<span class="text-lg leading-none whitespace-nowrap">
					{isValidName ? (username ?? 'Discord N/A') : 'Invalid!'}
				</span>
				{#if isValidName && username}
					{#if linked}
						<Check />
					{:else}
						<CircleX size={16} />
					{/if}
				{/if}
			</div>
		</div>
	{/snippet}
	{#if isValidName}
		<div class="text-md text-center">
			{#if linked}
				<p class="font-semibold">Account Linked</p>
			{:else}
				<p class="font-semibold">Not Linked</p>
				<p>
					Link your account on the <a href="/profile" class="text-link">profile page</a>
				</p>
			{/if}
		</div>
	{:else}
		<p class="max-w-sm text-center">User entered a name that contains invalid characters on Hypixel.</p>
	{/if}
</Popover.Mobile>
