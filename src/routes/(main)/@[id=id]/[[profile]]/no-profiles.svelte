<script lang="ts">
	import { page } from '$app/state';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import Head from '$comp/head.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import type { MinecraftAccountDto } from '$lib/api';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { Button } from '$ui/button';
	import { watch } from 'runed';
	import { tick } from 'svelte';

	interface Props {
		account: MinecraftAccountDto;
	}

	let { account }: Props = $props();

	const path = $derived(`/@${encodeURIComponent(account.name)}`);
	const imageUrl = $derived(`https://api.elitebot.dev/account/${account.id}/face.png`);
	const description = $derived(
		`View Minecraft account details for ${account.name}. Elite could not find an active Hypixel SkyBlock profile for this player yet.`
	);
	const knownProfileCount = $derived(account.profiles?.length ?? 0);
	const guildName = $derived(account.playerData?.guildMember?.guild?.name ?? null);
	const firstLogin = $derived.by(() => {
		const value = Number(account.playerData?.firstLogin ?? 0);
		return value > 0 ? value : null;
	});
	const lastLogin = $derived.by(() => {
		const value = Number(account.playerData?.lastLogin ?? 0);
		return value > 0 ? value : null;
	});

	const pageCtx = getPageCtx();
	const favorites = getFavoritesContext();

	const crumbs = $derived<Crumb[]>([
		{
			name: account.name,
			href: path,
		},
	]);
	const sidebarCrumbs = $derived<Crumb[]>([
		{
			icon: PlayerHead,
			name: account.name,
			capitalize: false,
			href: path,
			tooltip: 'Player',
			data: {
				uuid: account.id,
			},
		},
	]);

	watch.pre(
		() => [crumbs, sidebarCrumbs, account.id, page.url.pathname],
		() => {
			pageCtx.setBreadcrumbs(crumbs);
			pageCtx.setSidebar('Account', sidebarCrumbs);
			tick().then(() => {
				favorites.setPage({
					icon: imageUrl,
					name: document.title,
					href: page.url.pathname,
				});
			});
		}
	);
</script>

<Head
	title="{account.name} | Minecraft Account"
	{description}
	{imageUrl}
	canonicalPath="/@{encodeURIComponent(account.name)}"
	keywords="minecraft account, hypixel player, skyblock player, elite"
/>

<section class="mx-auto my-12 flex w-full max-w-5xl flex-col gap-6 md:px-4">
	<div
		class="bg-card flex flex-col gap-6 rounded-3xl border p-6 shadow-xl md:flex-row md:items-center md:justify-between"
	>
		<div class="flex items-start gap-4 md:items-center">
			<PlayerHead uuid={account.id} class="size-10 rounded-xl md:size-20" />
			<div class="flex flex-col gap-2">
				<p class="sr-only">Minecraft Account</p>
				<h1 class="text-3xl font-bold">{account.name}</h1>
				<p class="text-muted-foreground max-w-2xl text-sm md:text-base">
					This player has a valid Minecraft account, but there is no active Hypixel SkyBlock profile available
					to render stats right now.
				</p>
			</div>
		</div>
		<div class="flex flex-wrap gap-3">
			<Button href="/" variant="secondary">Back</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="bg-card rounded-2xl border p-5">
			<p class="text-muted-foreground mb-1 text-sm font-medium">UUID</p>
			<div class="flex items-center gap-2">
				<span class="min-w-0 flex-1 font-mono text-sm break-all">{account.id}</span>
				<CopyToClipboard text={account.id} class="-my-2 size-8 shrink-0" />
			</div>
		</div>

		{#if guildName}
			<div class="bg-card rounded-2xl border p-5">
				<p class="text-muted-foreground mb-1 text-sm font-medium">Guild</p>
				<p class="text-sm">{guildName}</p>
			</div>
		{/if}

		{#if account.discordUsername || account.discordId}
			<div class="bg-card rounded-2xl border p-5">
				<p class="text-muted-foreground mb-1 text-sm font-medium">Linked Discord</p>
				<p class="text-sm">{account.discordUsername ?? account.discordId}</p>
			</div>
		{/if}

		{#if firstLogin}
			<div class="bg-card rounded-2xl border p-5">
				<p class="text-muted-foreground mb-1 text-sm font-medium">First Seen on Hypixel</p>
				<DateDisplay timestamp={firstLogin} />
			</div>
		{/if}

		{#if lastLogin}
			<div class="bg-card rounded-2xl border p-5">
				<p class="text-muted-foreground mb-1 text-sm font-medium">Last Login</p>
				<DateDisplay timestamp={lastLogin} />
			</div>
		{/if}
	</div>

	<div
		class="bg-muted/40 {knownProfileCount > 0
			? 'border-destructive'
			: 'border-dashed'} rounded-2xl border p-5 text-sm leading-6"
	>
		<p class="font-semibold">No skyblock stats found!</p>
		<p class="text-muted-foreground mt-2">
			This page only shows full stat pages after it can match the account to an active Hypixel SkyBlock profile.
			If the player starts playing SkyBlock later or their profile becomes available again, this page will
			automatically update to show their stats.
		</p>

		{#if knownProfileCount > 0}
			<p class="text-destructive/80 mt-2 font-medium">
				There are {knownProfileCount} known deleted profiles for this account.
			</p>
		{/if}
	</div>
</section>
