<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import Head from '$comp/head.svelte';
	import LinkOptions from '$comp/settings/link-options.svelte';
	import LinkingGuide from '$comp/settings/linking-guide.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import { Input } from '$ui/input';
	import { Separator } from '$ui/separator';
	import Check from '@lucide/svelte/icons/check';
	import { untrack } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const ctx = getGlobalContext();

	let step = $state(1);
	let loading = $state(false);
	let mcUsername = $state('');
	let skipExisting = $state(false);

	const user = $derived(data.user);
	const hasLinkedAccount = $derived(user?.minecraftAccounts && user.minecraftAccounts.length > 0);
	const discordUsername = $derived(
		user?.discriminator && user.discriminator !== '0' ? `${user?.username}#${user.discriminator}` : user?.username
	);

	$effect(() => {
		if (data.user) {
			untrack(() => {
				ctx.user = data.user;
			});
		}
	});

	function nextStep() {
		step++;
	}

	$effect(() => {
		if (form?.success) {
			step = 3;
		}
	});

	function finish() {
		goto(data.redirectTo);
	}
</script>

<Head title="Onboarding" description="Welcome to Elite!" />

<div class="bg-background flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-lg">
		<Card.Header>
			<Card.Title class="text-2xl">
				{#if step === 1}
					Welcome, {user?.username}!
				{:else if step === 2}
					Link Minecraft Account
				{/if}
			</Card.Title>
			<Card.Description>
				{#if step === 1}
					Let's get your account set up.
				{:else if step === 2}
					Connect your Minecraft account to access all features.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			{#if step === 2}
				<Separator />
			{/if}
			{#if step === 1}
				<div class="flex items-center gap-4 rounded-lg border p-4">
					<div class="relative size-16 overflow-hidden rounded-full">
						<UserIcon {user} size={64} class="size-full" />
					</div>
					<div>
						<p class="text-lg font-semibold">{user?.displayName}</p>
						<p class="text-muted-foreground">{user?.username}</p>
					</div>
				</div>
			{:else if step === 2}
				{#if hasLinkedAccount}
					<div class="bg-muted/50 rounded-lg border p-4">
						<p class="text-completed font-semibold">Account Linked!</p>
						<p>You have already linked <strong>{user?.minecraftAccounts?.[0]?.name}</strong>.</p>
					</div>
				{:else}
					{#if data.accountOptions?.length && !skipExisting}
						<LinkOptions
							username={discordUsername}
							onSelect={(option) => {
								mcUsername = option.ign;
							}}
						>
							<Button variant="outline" class="mt-2" onclick={() => (skipExisting = true)}>
								Use a different account
							</Button>
							{#snippet button(option)}
								<form
									method="POST"
									action="?/link"
									use:enhance={() => {
										loading = true;
										return async ({ update }) => {
											loading = false;
											await update();
										};
									}}
									class="flex flex-col gap-4"
								>
									<input type="hidden" name="ign" value={option.ign} />
									<Button type="submit" disabled={loading}>Link</Button>
								</form>
							{/snippet}
						</LinkOptions>
					{/if}
					{#if !data.accountOptions?.length || skipExisting}
						<form
							method="POST"
							action="?/link"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									loading = false;
									await update();
								};
							}}
							class="flex flex-col gap-4"
						>
							<div class="flex flex-col gap-2">
								<label for="ign" class="text-sm font-medium">Minecraft Username</label>
								<Input
									id="ign"
									name="ign"
									autocomplete="off"
									placeholder="Enter your IGN"
									bind:value={mcUsername}
									disabled={loading}
								/>
							</div>

							<Button type="submit" disabled={loading}>
								{loading ? 'Linking...' : 'Link Account'}
							</Button>
						</form>
						<div class="mx-auto mt-4 flex w-full flex-col text-center">
							<p class="text-muted-foreground mb-2 text-sm">
								Ensure <span class="text-foreground font-mono select-all">{discordUsername}</span> is linked
								in hypixel.net social menu.
							</p>
							<LinkingGuide username={discordUsername} />
						</div>
					{/if}
				{/if}
				<div class="text-muted-foreground text-sm">
					<p>
						<strong>Note:</strong> You can add secondary accounts later in your profile settings.
					</p>
				</div>
			{:else if step === 3}
				<div class="flex flex-col items-center gap-4 text-center">
					<div class="bg-completed/10 dark:bg-completed/20 rounded-full p-3">
						<!-- Check icon -->
						<Check class="text-completed h-6 w-6" />
					</div>
					<h3 class="text-xl font-semibold">Welcome to Elite!</h3>
					<p class="text-muted-foreground">Your account is fully set up. You can now access all features.</p>
				</div>
			{/if}
			{#if step === 2}
				<Separator />
			{/if}
		</Card.Content>
		<Card.Footer class="flex justify-between">
			{#if step === 1}
				<Button variant="ghost" href="/logout">Logout</Button>
				<Button onclick={nextStep}>Continue</Button>
			{:else if step === 2}
				<Button
					variant="ghost"
					onclick={() => {
						if (skipExisting) {
							skipExisting = false;
						} else {
							step = 1;
						}
					}}>Back</Button
				>
				{#if hasLinkedAccount}
					<Button onclick={nextStep}>Continue</Button>
				{:else}
					<Button variant="ghost" onclick={nextStep}>Skip for now</Button>
				{/if}
			{:else}
				<div class="w-full">
					<Button class="w-full" onclick={finish}>Get Started</Button>
				</div>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
