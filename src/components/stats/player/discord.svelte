<script lang="ts">
	import * as Popover from '$ui/popover';
	import DiscordIcon from './discord-icon.svelte';
	import Check from 'lucide-svelte/icons/check';
	import CircleX from 'lucide-svelte/icons/circle-x';

	export let username: string | null | undefined = 'Discord N/A';
	export let linked: boolean;

	$: validName = true;

	$: {
		// Less strict check for old usernames with #
		if (username?.includes('#')) {
			validName = !username.includes('://') && !username.includes('discord');
		} else {
			// Check if name has anything other than letters, numbers, underscores, and periods
			const regex = /[^a-zA-Z0-9_.#]/g;
			validName = !(username && regex.test(username));
		}
	}
</script>

<Popover.Mobile>
	<div slot="trigger">
		<div class="block max-w-fit p-2 px-3 rounded-md bg-primary-foreground" id="discordId">
			<div class="flex flex-row items-center gap-2">
				<span class="text-primary mt-1 w-5 h-5">
					<DiscordIcon />
				</span>
				<span class="whitespace-nowrap text-lg leading-none">
					{validName ? username ?? 'Discord N/A' : 'Invalid!'}
				</span>
				{#if validName && username}
					{#if linked}
						<Check />
					{:else}
						<CircleX size={16} />
					{/if}
				{/if}
			</div>
		</div>
	</div>
	{#if validName}
		<div class="text-center text-md">
			{#if linked}
				<p class="font-semibold">Account Linked</p>
			{:else}
				<p class="font-semibold">Not Linked</p>
				<p>
					Link your account on the <a href="/profile" class="text-blue-500">profile page</a>
				</p>
			{/if}
		</div>
	{:else}
		<p class="max-w-sm text-center">User entered a name that contains invalid characters on Hypixel.</p>
	{/if}
</Popover.Mobile>
