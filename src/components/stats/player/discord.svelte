<script lang="ts">
	import { Popover } from 'flowbite-svelte';
	import { CheckSolid, CloseCircleSolid, DiscordSolid } from 'flowbite-svelte-icons';

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

<div class="block max-w-fit p-2 px-3 rounded-md bg-gray-200 dark:bg-zinc-700" id="discordId">
	<div class="flex flex-row items-center gap-2">
		<span class="mt-[0.1rem]">
			<DiscordSolid />
		</span>
		<h3 class="whitespace-nowrap text-lg leading-none">
			{validName ? username ?? 'Discord N/A' : 'Invalid!'}
		</h3>
		{#if validName}
			<div class="block w-4 h-4">
				{#if linked}
					<CheckSolid size="sm" />
				{:else}
					<CloseCircleSolid size="sm" />
				{/if}
			</div>
			<Popover triggeredBy="#discordId" placement="bottom" class="z-20">
				<div class="text-center">
					{#if linked}
						<p class="text-black dark:text-white">Linked</p>
					{:else}
						<p class="text-black dark:text-white">Not Linked</p>
						<p>
							Link your account on the <a href="/profile" class="text-blue-500">profile page</a>
						</p>
					{/if}
				</div>
			</Popover>
		{:else}
			<Popover triggeredBy="#discordId" placement="top">
				<p class="max-w-sm">User entered a name that contains invalid characters on Hypixel.</p>
			</Popover>
		{/if}
	</div>
</div>
