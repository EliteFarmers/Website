<script lang="ts">
	import { enhance } from '$app/forms';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Star from '@lucide/svelte/icons/star';
	import Unlink from '@lucide/svelte/icons/unlink';

	interface Props {
		mc?: Partial<components['schemas']['MinecraftAccountDetailsDto']>;
		confirmMcUnlink?: (mcUsername: string | undefined) => void;
	}

	let { mc = {}, confirmMcUnlink }: Props = $props();
	let loading = $state(false);
</script>

<div class="bg-card flex flex-col gap-2 rounded-md p-4">
	<div class="flex flex-row items-center justify-between gap-2">
		<div class="flex items-center gap-4">
			<PlayerHead uuid={mc.id} size="2xl" />
			<h1 class="font-mono text-xl font-semibold">{mc.name}</h1>
		</div>
		<div class="flex items-center gap-2">
			{#if mc.primaryAccount}
				<Popover.Mobile>
					{#snippet trigger()}
						<Star size={16} class="text-completed fill-current" />
					{/snippet}
					<p class="font-semibold">Primary Account</p>
					<div class="pt-2">
						<p>All Elite features will show stats of this account by default.</p>
					</div>
				</Popover.Mobile>
			{/if}

			<Button
				type="button"
				onclick={() => confirmMcUnlink?.(mc.name)}
				disabled={loading}
				size="sm"
				variant="ghost"
				class="text-muted-foreground hover:text-destructive"
			>
				{#if loading}
					<LoaderCircle class="animate-spin" size={16} />
				{:else}
					<Unlink size={16} />
				{/if}
			</Button>

			<form
				class="contents"
				method="POST"
				action="?/unlink"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						if (result) loading = false;
						update();
					};
				}}
			></form>
		</div>
	</div>
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<div class="flex flex-row items-center gap-1 leading-none">
			<p class="text-muted-foreground text-xs sm:text-sm">{mc.id}</p>
			<CopyToClipboard text={mc.id} size="sm" class="text-muted-foreground hover:text-foreground" />
		</div>
	</div>
	<Button href="/@{mc.name}" size="sm" variant="outline">Stats</Button>
	{#if !mc.primaryAccount}
		<form
			class="contents"
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
			<Button type="submit" disabled={loading} size="sm" variant="default">Set As Primary</Button>
		</form>
	{/if}
</div>
