<script lang="ts">
	import * as Tooltip from '$ui/tooltip';
	import DiscordIcon from './discord-icon.svelte';
	import { CheckIcon, XCircle } from 'lucide-svelte/icons';

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

<Tooltip.Root openDelay={50}>
	<Tooltip.Trigger>
		<div class="block max-w-fit p-2 px-3 rounded-md bg-card" id="discordId">
			<div class="flex flex-row items-center gap-2">
				<span class="text-primary mt-1 w-5 h-5">
					<DiscordIcon />
				</span>
				<h3 class="whitespace-nowrap text-lg leading-none">
					{validName ? username ?? 'Discord N/A' : 'Invalid!'}
				</h3>
				{#if validName && username}
					{#if linked}
						<CheckIcon />
					{:else}
						<XCircle size={16} />
					{/if}
				{/if}
			</div>
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content side="bottom">
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
	</Tooltip.Content>
</Tooltip.Root>
