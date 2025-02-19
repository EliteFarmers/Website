<script lang="ts">
	import { enhance } from '$app/forms';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import Star from 'lucide-svelte/icons/star';

	interface Props {
		mc?: Partial<components['schemas']['MinecraftAccountDetailsDto']>;
	}

	let { mc = {} }: Props = $props();
	let loading = $state(false);
</script>

<div class="flex flex-col rounded-md bg-card p-4">
	<div class="flex flex-row items-center justify-between gap-2">
		<div class="flex flex-row items-center gap-4">
			<img class="pixel w-12" src="https://mc-heads.net/head/{mc.id}" alt="{mc.name} player skull" />
			<h1 class="font-mono text-xl font-semibold">{mc.name}</h1>

			{#if mc.primaryAccount}
				<Popover.Mobile>
					{#snippet trigger()}
						<Star size={16} class="fill-current text-completed" />
					{/snippet}
					<p class="font-semibold">Primary Account</p>
					<div class="pt-2">
						<p>All Elite features will show stats of this account by default.</p>
					</div>
				</Popover.Mobile>
			{/if}
		</div>

		<Button href="/@{mc.name}" size="sm" variant="outline">Stats</Button>
	</div>
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<div class="flex flex-row items-center gap-1 leading-none">
			<p class="text-xs text-muted-foreground sm:text-sm">{mc.id}</p>
			<CopyToClipboard text={mc.id} size="sm" class="-m-2" />
		</div>
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
				<button disabled={loading} class="whitespace-nowrap text-sm text-muted-foreground underline"
					>Set As Primary</button
				>
			</form>
		{/if}
	</div>
</div>
