<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import type { PageData, ActionData } from './$types';
	import DiscordAccount from './discordAccount.svelte';
	import Guild from './guild.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { PUBLIC_BADGE_IMAGE_URL } from '$env/static/public';
	import { Switch } from '$ui/switch';

	export let data: PageData;
	export let form: ActionData;
	let loading = false;

	$: user = data.user || undefined;

	$: badges = (user?.minecraftAccounts ?? [])
		.filter((mc) => mc.badges && mc.badges.length > 0)
		.map((mc) => ({
			name: mc.name,
			uuid: mc.id,
			badges: mc.badges?.sort((a, b) => (b.order ?? 0) - (a.order ?? 0)),
		}));

	$: discordUsername =
		user?.discriminator && user.discriminator !== '0' ? `${user?.username}#${user.discriminator}` : user?.username;
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<main class="flex flex-col lg:flex-row justify-center gap-16 my-16 mx-2 justify-items-center">
	<div class="flex flex-col items-center">
		{#key loading}
			<div class="w-full max-w-2xl mb-8">
				<DiscordAccount account={user} />
			</div>
		{/key}

		<!-- Form to input username to link account -->
		<form
			method="POST"
			class="w-full max-w-md mb-16"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					// Wait for a bit so the user can see the loading state
					await new Promise((r) => setTimeout(r, 500));
					await applyAction(result);

					if (result) {
						loading = false;
					}

					if (result.type === 'redirect') {
						throw goto(result.location);
					}

					if (result.type === 'error' || result.type === 'failure') {
						if ('error' in result) {
							toast.error(result.error.replaceAll('`', '"'), {
								duration: 5000,
							});
						} else if ('data' in result && result.data?.error && typeof result.data.error === 'string') {
							toast.error(result.data?.error.replaceAll('`', '"') ?? 'Something went wrong!', {
								duration: 5000,
							});
						}
					} else if (typeof result.data?.message === 'string') {
						toast.success(result.data.message ?? 'Success!', {
							duration: 5000,
						});
					}
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
	</div>
	<section class="flex flex-col max-w-3xl w-full">
		<h1 class="text-2xl mb-4 mx-4">Servers With Leaderboards</h1>
		{#if data.publicGuilds.length === 0}
			<p>You're not a member of any public guilds!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.publicGuilds as guild (guild.id)}
				<Guild {guild} link={true} />
			{/each}
		</div>

		<h1 class="text-2xl mb-4 mx-4">Manage Servers</h1>
		{#if data.guildsWithBot.length === 0}
			<p>You don't manage any servers with the bot invited!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.guildsWithBot as guild (guild.id)}
				<Guild {guild} />
			{/each}
		</div>

		<h1 class="text-2xl mb-4 mx-4">Manage Badges</h1>
		{#if !user.minecraftAccounts?.some((mc) => mc.badges && mc.badges.length > 0)}
			<p class="mb-16">You don't have any badges yet!</p>
		{/if}
		{#each badges as profile (profile.uuid)}
			<form action="?/updateBadges" method="post" class="flex flex-col gap-4 mx-4">
				<h3 class="text-xl mt-4">Badges for {profile.name}</h3>
				{#each profile?.badges ?? [] as badge, i (badge.id ?? i)}
					{@const id = badge.id ?? ''}
					<div class="flex flex-row gap-4 items-center">
						<input type="hidden" name="badge.{id}" value={id} />
						<input type="hidden" name="badge.{id}.order" value={i} />
						<Switch name="badge.{id}.visible" checked={badge.visible} />
						<img
							src="{PUBLIC_BADGE_IMAGE_URL}{badge.imageId}.png"
							alt={badge.name}
							class="w-18 h-6 md:w-24 md:h-8 rounded-sm object-cover"
						/>
						<div class="flex flex-1 flex-col gap-1 max-w-md">
							<p class="text-lg font-semibold">{badge.name}</p>
							<p>{badge.description}</p>
						</div>
						<div class="flex flex-1 flex-col gap-1 max-w-md">
							<p class="font-semibold mt-1">Requirements</p>
							<p>{badge.requirements}</p>
						</div>
					</div>
				{/each}
				<input type="hidden" name="uuid" value={profile.uuid} />
				<Button type="submit" class="max-w-fit">Update Settings</Button>
			</form>
		{/each}

		<h1 class="text-2xl mb-4 mx-4 mt-16">Other Servers</h1>
		{#if data.guilds.length === 0}
			<p>No servers found! Try refreshing the page if this is wrong.</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.guilds as guild (guild.id)}
				<Guild {guild} />
			{/each}
		</div>
	</section>
</main>
