<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import DiscordAccount from './discordAccount.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import MinecraftAccount from './minecraftAccount.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);

	let user = $derived(data.user || undefined);
	let primary = $derived(user?.minecraftAccounts?.find((mc) => mc.primaryAccount) || undefined);
	let secondary = $derived(user?.minecraftAccounts?.filter((mc) => !mc.primaryAccount) || []);

	let discordUsername = $derived(
		user?.discriminator && user.discriminator !== '0' ? `${user?.username}#${user.discriminator}` : user?.username
	);
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<div class="mx-2 my-16 flex flex-col justify-start gap-12">
	<section class="flex flex-col items-start gap-4">
		<h1 class="mb-4 text-3xl">Discord Account</h1>
		{#key loading}
			<DiscordAccount account={user} />
		{/key}
	</section>
	<section class="flex flex-col items-start gap-4">
		<h2 class="mb-4 text-2xl">Primary Minecraft Account</h2>

		{#if primary}
			<MinecraftAccount mc={primary} />
		{:else}
			<p class="text-lg">No primary account set.</p>
		{/if}
	</section>
	<section class="flex flex-col items-start gap-4">
		<h2 class="text-2xl">Secondary Minecraft Account{secondary.length > 1 ? 's' : ''}</h2>
		<p class="mb-4 max-w-2xl text-sm">
			Your primary account is the account that will be used for all Elite features by default. Secondary accounts
			essentially only exist for the purpose of confirming ownership of the account.
		</p>
		{#if secondary.length > 0}
			{#each secondary as mc, i (mc.id ?? i)}
				<MinecraftAccount {mc} />
			{/each}
		{:else}
			<p class="text-lg">No secondary accounts linked.</p>
		{/if}
	</section>
	<section class="flex flex-col items-start gap-4">
		<h2 class="mb-4 text-2xl">Link/Unlink an Account</h2>

		<!-- Form to input username to link account -->
		<form
			method="POST"
			class="w-full max-w-md"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					// Wait for a bit so the user can see the loading state
					await new Promise((r) => setTimeout(r, 500));
					loading = false;
					await invalidateAll();
					await applyAction(result);
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
					<Button type="submit" formaction="?/link" class="flex-1" variant="secondary" disabled={loading}>
						Link Account
					</Button>
					<Button type="submit" formaction="?/unlink" class="flex-1" variant="secondary" disabled={loading}>
						Unlink Account
					</Button>
				</div>
				{#if form?.error}
					<span class="text-destructive text-sm"
						>{form?.error?.toString().replaceAll('`', '"') ?? 'Something went wrong!'}</span
					>
				{/if}
			</div>
		</form>

		{#if !user?.minecraftAccounts?.length}
			<div class="flex flex-col text-center">
				<h1 class="py-2 text-lg">
					Ensure <span class="text-progress select-all">{discordUsername}</span> is linked in Hypixel.net as follows:
				</h1>
				<video autoplay loop muted class="w-full max-w-md rounded-md" src="/images/HypixelLink.mp4">
					<h1 class="text-md py-2">
						(Enter <span class="text-progress select-all">{discordUsername}</span>, the video is just the
						example)
					</h1>
				</video>
			</div>
		{/if}
	</section>
</div>
