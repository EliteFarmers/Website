<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import DiscordAccount from './discordAccount.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import MinecraftAccount from './minecraftAccount.svelte';

	export let data: PageData;
	export let form: ActionData;
	let loading = false;

	$: user = data.user || undefined;
	$: primary = user?.minecraftAccounts?.find((mc) => mc.primaryAccount) || undefined;
	$: secondary = user?.minecraftAccounts?.filter((mc) => !mc.primaryAccount) || [];

	$: discordUsername =
		user?.discriminator && user.discriminator !== '0' ? `${user?.username}#${user.discriminator}` : user?.username;
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<main class="flex flex-col justify-start gap-12 my-16 mx-2">
	<section class="flex flex-col items-start gap-4">
		<h1 class="text-3xl mb-4">Discord Account</h1>
		{#key loading}
			<DiscordAccount account={user} />
		{/key}
	</section>
	<section class="flex flex-col items-start gap-4">
		<h2 class="text-2xl mb-4">Primary Minecraft Account</h2>

		{#if primary}
			<MinecraftAccount mc={primary} />
		{:else}
			<p class="text-lg">No primary account set.</p>
		{/if}

		<p class="max-w-2xl text-sm">
			Your primary account is the account that will be used for all Elite features by default. Secondary accounts
			essentially only exist for the purpose of confirming ownership of the account.
		</p>

		{#if !user?.minecraftAccounts?.length}
			<div class="text-center flex flex-col">
				<h1 class="text-lg py-2">
					Ensure <span class="text-green-500 select-all">{discordUsername}</span> is linked in Hypixel.net as follows:
				</h1>
				<video autoplay loop muted class="w-full max-w-md rounded-md" src="/images/HypixelLink.mp4" />
				<h1 class="text-md py-2">
					(Enter <span class="text-green-500 select-all">{discordUsername}</span>, the video is just the
					example)
				</h1>
			</div>
		{/if}
	</section>
	<section class="flex flex-col items-start gap-4">
		<h2 class="text-2xl mb-4">Secondary Minecraft Account{secondary.length > 1 ? 's' : ''}</h2>

		{#if secondary.length > 0}
			{#each secondary as mc, i (mc.id ?? i)}
				<MinecraftAccount {mc} />
			{/each}
		{:else}
			<p class="text-lg">No secondary accounts linked.</p>
		{/if}
	</section>
	<section class="flex flex-col items-start gap-4">
		<h2 class="text-2xl mb-4">Link/Unlink an Account</h2>

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
			<div class="flex flex-col gap-4 items-center w-full">
				<div class="grid col-span-1 relative w-full">
					<Input
						type="text"
						name="username"
						class="w-full px-4 py-2 border-2 roundedtext-center"
						placeholder="Enter your Minecraft username"
						disabled={loading}
					/>
				</div>
				<div class="flex flex-col lg:flex-row gap-2 w-full">
					<Button type="submit" formaction="?/link" class="flex-1" variant="secondary" disabled={loading}>
						Link Account
					</Button>
					<Button type="submit" formaction="?/unlink" class="flex-1" variant="secondary" disabled={loading}>
						Unlink Account
					</Button>
				</div>
				{#if form?.error}
					<span class="text-red-600 text-sm"
						>{form?.error?.replaceAll('`', '"') ?? 'Something went wrong!'}</span
					>
				{/if}
			</div>
		</form>
		{#if !user?.minecraftAccounts?.length}
			<div class="text-center flex flex-col">
				<p class="text-lg py-2">
					Ensure <span class="text-green-500 select-all">{discordUsername}</span> is linked in Hypixel.net as follows:
				</p>
				<video autoplay loop muted class="w-full max-w-md rounded-md" src="/images/HypixelLink.mp4" />
				<p class="text-md py-2">
					(Enter <span class="text-green-500 select-all">{discordUsername}</span>, the video is just the
					example)
				</p>
			</div>
		{/if}
	</section>
</main>
