<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import type { PageData, ActionData } from './$types';
	import DiscordAccount from './discordAccount.svelte';
	import Guild from './guild.svelte';
	import { PUBLIC_BADGE_IMAGE_URL } from '$env/static/public';
	import { Switch } from '$ui/switch';
	import { onMount } from 'svelte';
	import { ArrowDown, ArrowUp } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import Entitlement from './entitlement.svelte';
	import { Label } from '$ui/label';
	import { SelectSimple } from '$ui/select';

	export let data: PageData;
	export let form: ActionData;
	let loading = false;

	$: user = data.user || undefined;

	$: badges = mapBadges(user?.minecraftAccounts ?? []);

	function mapBadges(accounts: PageData['user']['minecraftAccounts'] = []) {
		return accounts
			.filter((mc) => mc.badges && mc.badges.length > 0)
			.map((mc) => ({
				name: mc.name,
				uuid: mc.id,
				badges: mc.badges?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
			}));
	}

	$: visibleToggles = {} as Record<string, boolean>;

	onMount(() => {
		visibleToggles = badges.reduce<Record<string, boolean>>((acc, mc) => {
			mc.badges?.forEach((badge) => {
				acc[`${mc.uuid}-${badge.id}`] = badge.visible ?? false;
			});
			return acc;
		}, {});
	});

	$: discordUsername =
		user?.discriminator && user.discriminator !== '0' ? `${user?.username}#${user.discriminator}` : user?.username;

	$: unlockedSettings = {
		weightStyle: data.user.entitlements?.some((e) => (e.product.features?.weightStyles?.length ?? 0) > 0) ?? false,
		embedColor: data.user.entitlements?.some((e) => (e.product.features?.embedColors?.length ?? 0) > 0) ?? false,
		shopPromotions: data.user.entitlements?.some((e) => e.product.features?.hideShopPromotions) ?? false,
		styleOverride: data.user.entitlements?.some((e) => e.product.features?.weightStyleOverride) ?? false,
		moreInfo: data.user.entitlements?.some((e) => e.product.features?.moreInfoDefault) ?? false,
	};

	let changedSettings = {
		weightStyle: data.user.settings?.features?.weightStyle ?? '',
		embedColor: data.user.settings?.features?.embedColor ?? '',
		shopPromotions: data.user.settings?.features?.hideShopPromotions ?? false,
		styleOverride: data.user.settings?.features?.weightStyleOverride ?? false,
		moreInfo: data.user.settings?.features?.moreInfoDefault ?? false,
	};

	$: weightStyleOptions = [
		{ label: 'Default', value: '' },
		...(data.user.entitlements ?? [])
			.filter((e) => (e.product.features?.weightStyles?.length ?? 0) > 0)
			.map((e) => e.product.features?.weightStyles ?? [])
			.flat()
			.map((e) => ({ label: e, value: e })),
	];

	$: embedColorOptions = [
		{ label: 'Default', value: '' },
		...(data.user.entitlements ?? [])
			.filter((e) => (e.product.features?.embedColors?.length ?? 0) > 0)
			.map((e) => e.product.features?.embedColors ?? [])
			.flat()
			.map((e) => ({ label: e, value: e, color: '#' + e })),
	];
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
	<section class="flex flex-col max-w-3xl w-full mx-4">
		<h1 class="text-2xl mb-4">Public Servers</h1>
		{#if data.publicGuilds.length === 0}
			<p>You're not a member of any public guilds!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.publicGuilds as guild (guild.id)}
				<Guild {guild} link={true} />
			{/each}
		</div>

		<h1 class="text-2xl mb-4">Manage Servers</h1>
		{#if data.guildsWithBot.length === 0}
			<p>You don't manage any servers with the bot invited!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.guildsWithBot as guild (guild.id)}
				<Guild {guild} />
			{/each}
		</div>

		<h1 class="text-2xl mb-4">Purchases</h1>
		{#if data.user.entitlements?.length === 0}
			<p>
				You don't manage any shop purchases! Check out the <a href="/shop" class="text-blue-400 hover:underline"
					>Discord Shop!</a
				>
			</p>
		{/if}
		<p class="mb-2">
			Check out the <a href="/shop" class="text-blue-400 hover:underline">Discord Shop!</a>
		</p>
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense">
			{#each data.user.entitlements ?? [] as purchase (purchase.id)}
				<Entitlement entitlement={purchase} />
			{/each}
		</div>
		<form
			action="?/refreshPurchases"
			method="post"
			class="mt-2 mb-16"
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
			<Button type="submit" disabled={loading} variant="secondary">Refresh Purchases</Button>
		</form>

		<h1 class="text-2xl mb-4">User Settings</h1>
		<form
			action="?/updateSettings"
			method="post"
			class="flex flex-col gap-4 mb-12 max-w-md"
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
			<div class="space-y-2">
				<Label>Weight Command Style</Label>
				<SelectSimple
					name="style"
					options={weightStyleOptions}
					bind:value={changedSettings.weightStyle}
					disabled={loading || !unlockedSettings.weightStyle}
				/>
			</div>
			<div class="space-y-2">
				<Label>Bot Embed Color</Label>
				<SelectSimple
					name="embed"
					options={embedColorOptions}
					bind:value={changedSettings.embedColor}
					disabled={loading || !unlockedSettings.embedColor}
				/>
			</div>
			<div class="flex flex-row gap-2 items-center">
				<Switch
					bind:checked={changedSettings.shopPromotions}
					disabled={loading || !unlockedSettings.shopPromotions}
				/>
				<Label>Hide shop promotions</Label>
				<input type="hidden" name="promotions" bind:value={changedSettings.shopPromotions} />
			</div>
			<div class="flex flex-row gap-2 items-center">
				<Switch
					bind:checked={changedSettings.styleOverride}
					disabled={loading || !unlockedSettings.styleOverride}
				/>
				<Label>Apply Weight Style on everyone</Label>
				<input type="hidden" name="override" bind:value={changedSettings.styleOverride} />
			</div>
			<div class="flex flex-row gap-2 items-center">
				<Switch bind:checked={changedSettings.moreInfo} disabled={loading || !unlockedSettings.moreInfo} />
				<Label>"More Info" in weight command by default</Label>
				<input type="hidden" name="info" bind:value={changedSettings.moreInfo} />
			</div>
			<Button type="submit" class="max-w-fit" disabled={loading}>Update Settings</Button>
		</form>

		<h1 class="text-2xl mb-4">Manage Badges</h1>
		{#if !user.minecraftAccounts?.some((mc) => mc.badges && mc.badges.length > 0)}
			<p class="mb-16">You don't have any badges yet!</p>
		{/if}
		{#each badges as profile (profile.uuid)}
			{@const length = profile.badges?.length ?? 0}
			<form
				action="?/updateBadges"
				method="post"
				class="flex flex-col gap-4"
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
				<h3 class="text-xl mt-4">Badges for {profile.name}</h3>
				{#each profile?.badges ?? [] as badge, i (badge.id ?? i)}
					{@const id = badge.id ?? ''}
					<div class="flex flex-row gap-4 items-center">
						<input type="hidden" name="badge.{id}" value={id} />
						<input type="hidden" name="badge.{id}.order" value={i} />
						<Switch bind:checked={visibleToggles[`${profile.uuid}-${badge.id}`]} />
						<input
							type="hidden"
							name="badge.{id}.visible"
							value={visibleToggles[`${profile.uuid}-${badge.id}`]}
						/>
						<img
							src="{PUBLIC_BADGE_IMAGE_URL}{badge.imageId}.png"
							alt={badge.name}
							class="w-18 h-6 md:w-24 md:h-8 rounded-sm object-cover"
						/>
						<div class="flex flex-row gap-1">
							<Button
								size="sm"
								disabled={i === 0 || length === 1}
								on:click={() => {
									const newOrder = Math.max(i - 1, 0);
									const old = profile.badges?.find((b) => b.order === newOrder);
									if (old) old.order = i;
									badge.order = newOrder;
									badges = badges;
								}}
							>
								<ArrowUp size={16} />
							</Button>
							<Button
								size="sm"
								disabled={i === length - 1 || length === 1}
								on:click={() => {
									const newOrder = Math.min(i + 1, length);
									const old = profile.badges?.find((b) => b.order === newOrder);
									if (old) old.order = i;
									badge.order = newOrder;
									badges = badges;
								}}
							>
								<ArrowDown size={16} />
							</Button>
						</div>
						<div class="flex flex-1 flex-col gap-1 max-w-md">
							<p class="text-lg font-semibold">{badge.name}</p>
							<p>{badge.description}</p>
						</div>
					</div>
				{/each}
				<input type="hidden" name="uuid" value={profile.uuid} />
				<Button type="submit" class="max-w-fit" disabled={loading}>Update Badges</Button>
			</form>
		{/each}

		<h1 class="text-2xl mb-4 mt-16">Other Servers</h1>
		<p>Missing a server above? <a href="invite" class="text-blue-500 underline">Invite the bot!</a></p>
	</section>
</main>
