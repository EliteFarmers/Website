<script lang="ts">
	import { Popover } from 'flowbite-svelte';

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

<div class="block max-w-fit p-2 px-3 m-1 rounded-md bg-gray-200 dark:bg-zinc-700">
	<div class="flex items-center gap-2">
		<h1 class="whitespace-nowrap text-base">{validName ? username ?? 'Discord N/A' : 'Invalid Discord Name'}</h1>
		{#if validName}
			<div class="block w-4 h-4 mt-1">
				{#if linked}
					<!-- Verified checkmark -->
					<svg class="w-4 h-4 fill-current text-green-500" viewBox="0 0 20 20">
						<path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
					</svg>
				{:else}
					<!-- Unverified (x) -->
					<svg class="text-red-500 w-4 h-4" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
						<path
							d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
						/>
					</svg>
				{/if}
				<Popover>
					<p>
						{#if linked}
							Verified
						{:else}
							Not&nbsp;Verified
						{/if}
					</p>
				</Popover>
			</div>
		{:else}
			<Popover>
				<p class="max-w-sm">
					User has a name that contains invalid characters entered on Hypixel. This probably means that they
					entered an invite URL, which we don't want to display here.
				</p>
			</Popover>
		{/if}
	</div>
</div>
