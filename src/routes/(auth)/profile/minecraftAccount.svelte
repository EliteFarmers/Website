<script lang="ts">
	import { enhance } from '$app/forms';
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import * as Tooltip from '$ui/tooltip';
	import StarIcon from 'lucide-svelte/icons/star';

	export let mc: components['schemas']['MinecraftAccountDetailsDto'] = {};
	let loading = false;
</script>

<div class="flex flex-col p-4 rounded-md bg-primary-foreground">
	<div class="flex flex-row justify-between items-center gap-2">
		<div class="flex flex-row items-center gap-4">
			<img class="pixel w-12" src="https://mc-heads.net/head/{mc.id}" alt="{mc.name} player skull" />
			<h1 class="text-xl font-semibold font-mono">{mc.name}</h1>

			{#if mc.primaryAccount}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<StarIcon size={16} class="text-yellow-500 fill-current" />
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p class="font-semibold">Primary Account</p>
						<div class="pt-2">
							<p>All Elite features will show stats of this account by default.</p>
						</div>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}
		</div>

		<Button href="/@{mc.name}" size="sm" variant="outline">Stats</Button>
	</div>
	<div class="flex flex-row justify-between items-baseline gap-4">
		<p class="text-sm text-gray-500">{mc.id}</p>
		{#if !mc.primaryAccount}
			<form
				method="POST"
				action="?/setPrimary"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						if (result) loading = false;
						update();
					};
				}}
			>
				<input type="hidden" name="username" value={mc.id} />
				<button disabled={loading} class="text-sm underline text-gray-600 dark:text-gray-400 whitespace-nowrap"
					>Set As Primary</button
				>
			</form>
		{/if}
	</div>
</div>
