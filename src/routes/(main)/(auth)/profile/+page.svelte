<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import LinkOptions from '$comp/settings/link-options.svelte';
	import LinkingGuide from '$comp/settings/linking-guide.svelte';
	import * as AlertDialog from '$ui/alert-dialog';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import type { Snippet } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import DiscordAccount from './discordAccount.svelte';
	import MinecraftAccount from './minecraftAccount.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let unlinkForm = $state<HTMLFormElement>(null!);
	let mcUsername = $state<string | undefined>(undefined);
	let dialogOpen = $state(false);

	const user = $derived(data.user || undefined);
	const primaryAccount = $derived(user?.minecraftAccounts?.find((mc) => mc.primaryAccount) || undefined);
	const hasPrimary = $derived(!!primaryAccount);
	const secondaryAccount = $derived(user?.minecraftAccounts?.filter((mc) => !mc.primaryAccount) || []);

	let discordUsername = $derived(
		user?.discriminator && user.discriminator !== '0' ? `${user?.username}#${user.discriminator}` : user?.username
	);

	function deleteConfirmation(username: string | undefined): void {
		if (!username) return;
		username = username.trim();
		if (username.length === 0) return;
		console.log('Unlinking Minecraft account:', username);
		mcUsername = username;
		dialogOpen = true;
	}
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<div class="mx-2 my-16 flex flex-col justify-start gap-12">
	<DiscordAccount account={user} />
	{#if hasPrimary}
		{@render section(primaryAccountSection)}
		{#snippet primaryAccountSection()}
			<h2 class="mb-4 text-2xl">Primary Minecraft Account</h2>

			<MinecraftAccount mc={primaryAccount} confirmMcUnlink={deleteConfirmation} />
		{/snippet}
	{/if}

	{#if secondaryAccount.length || hasPrimary}
		{@render section(secondaryAccountSection)}
		{#snippet secondaryAccountSection()}
			<h2 class="text-2xl">Secondary Minecraft Account{secondaryAccount.length > 1 ? 's' : ''}</h2>
			<p class="mb-4 max-w-2xl text-sm">
				Your primary account is the account that will be used for all Elite features by default. Secondary
				accounts essentially only exist for the purpose of confirming ownership of the account.
			</p>
			{#if secondaryAccount.length > 0}
				<div class="mx-auto grid grid-cols-2 gap-2">
					{#each secondaryAccount as mc, i (mc.id ?? i)}
						<MinecraftAccount {mc} confirmMcUnlink={deleteConfirmation} />
					{/each}
				</div>
			{:else}
				{@render emptyMessage('No secondary accounts linked.')}
			{/if}
		{/snippet}
	{/if}

	{@render section(accountLinkingSection)}
	{#snippet accountLinkingSection()}
		<h2 class="text-2xl">Link a Minecraft Account</h2>

		<!-- Form to input username to link account -->
		<form
			method="POST"
			class="mx-auto w-full max-w-md"
			use:enhance={() => {
				loading = true;
				return async ({ result, formElement }) => {
					// Wait for a bit so the user can see the loading state
					await new Promise((r) => setTimeout(r, 500));
					loading = false;
					await invalidateAll();
					await applyAction(result);
					if (result.status === 200) {
						mcUsername = undefined;
						dialogOpen = false;
						formElement.reset();
					}
				};
			}}
		>
			<div class="flex w-full flex-col items-center gap-4">
				<div class="relative col-span-1 grid w-full">
					<Input
						type="text"
						name="username"
						class="roundedtext-center w-full border-2 px-4 py-2"
						placeholder="Enter your Minecraft username"
						disabled={loading}
					/>
				</div>
				<div class="flex w-full flex-col gap-2 lg:flex-row">
					<Button
						type="submit"
						formaction="?/link"
						class="flex-1"
						variant={hasPrimary ? 'secondary' : 'default'}
						disabled={loading}
					>
						Link
					</Button>
				</div>
				{#if form?.error}
					<span class="text-destructive text-sm"
						>{form?.error?.toString().replaceAll('`', '"') ?? 'Something went wrong!'}</span
					>
				{/if}
			</div>
		</form>

		<div class="mx-auto flex flex-col text-center">
			<LinkOptions
				username={discordUsername}
				filter={(option) => !user?.minecraftAccounts?.some((mc) => mc.id !== option.uuid)}
			>
				{#snippet button(option)}
					<form
						method="POST"
						use:enhance={() => {
							loading = true;
							return async ({ result, formElement }) => {
								// Wait for a bit so the user can see the loading state
								await new Promise((r) => setTimeout(r, 500));
								loading = false;
								await invalidateAll();
								await applyAction(result);
								if (result.status === 200) {
									mcUsername = undefined;
									dialogOpen = false;
									formElement.reset();
								}
							};
						}}
					>
						<input type="hidden" name="username" value={option.ign} />
						<Button type="submit" class="flex-1" formaction="?/link" disabled={loading}>Link</Button>
					</form>
				{/snippet}
			</LinkOptions>
			<p class="py-2 text-lg">
				Ensure <span class="text-progress select-all">{discordUsername}</span> is linked in Hypixel.net as follows:
			</p>
			<LinkingGuide username={user?.username ?? ''} />
		</div>
	{/snippet}
</div>

<form
	class="contents"
	method="POST"
	action="?/unlink"
	bind:this={unlinkForm}
	use:enhance={() => {
		loading = true;
		return async ({ result, update }) => {
			if (result) loading = false;
			update();
			dialogOpen = false;
		};
	}}
>
	<input type="hidden" name="username" bind:value={mcUsername} />
</form>

<AlertDialog.Root bind:open={dialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This will unlink the <strong>{mcUsername}</strong> Minecraft account from your Elite account.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					unlinkForm.requestSubmit();
				}}>Continue</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

{#snippet section(children?: Snippet)}
	<section class="flex flex-col items-start gap-4 rounded-lg border p-4">
		{@render children?.()}
	</section>
{/snippet}

{#snippet emptyMessage(text: string)}
	<p class="text-muted-foreground w-full text-center text-sm">{text}</p>
{/snippet}
