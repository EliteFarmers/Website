<script lang="ts">
	import { enhance } from '$app/forms';
	import type { components } from '$lib/eliteapi/api';
	import { Button, Popover, Star } from 'flowbite-svelte';

	export let mc: components['schemas']['MinecraftAccountDetailsDto'] = {};
</script>

<div class="flex flex-col p-4 rounded-md bg-gray-300 dark:bg-zinc-700">
	<div class="flex flex-row justify-between items-center gap-2">
		<div class="flex flex-row items-center gap-4">
			<img class="pixel w-12" src="https://mc-heads.net/head/{mc.id}" alt="{mc.name} player skull" />
			<h1 class="text-xl font-semibold font-mono">{mc.name}</h1>

			{#if mc.primaryAccount}
				<Star class="-ml-4" />
				<Popover>
					<p slot="title">Primary Account</p>
					<div class="p-4">
						<p>All Elite features will show stats of this account by default.</p>
					</div>
				</Popover>
			{/if}
		</div>

		<Button href="/@{mc.name}" size="sm">Stats</Button>
	</div>
	<div class="flex flex-row justify-between items-baseline gap-4">
		<p class="text-sm text-gray-500">{mc.id}</p>
		{#if !mc.primaryAccount}
			<form method="post" action="?/setPrimary" use:enhance>
				<input type="hidden" name="username" value={mc.id} />
				<button class="text-sm underline text-gray-600 dark:text-gray-400 whitespace-nowrap"
					>Set As Primary</button
				>
			</form>
		{/if}
	</div>
</div>
