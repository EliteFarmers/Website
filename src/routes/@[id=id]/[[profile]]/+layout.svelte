<script lang="ts">
	import type { LayoutData } from './$types';
	import PlayerInfo from '$comp/stats/playerinfo.svelte';
	import { browser } from '$app/environment';
	import { Button } from '$ui/button';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import { tick, type Snippet } from 'svelte';
	import NavCrumbs from './nav-crumbs.svelte';
	import { watch } from 'runed';
	import { initStatsContext } from '$lib/stores/stats.svelte';
	import JoinElitePopup from '$comp/stats/player/join-elite-popup.svelte';
	import type { components } from '$lib/api/api';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	initStatsContext({
		account: data.account,
		selectedProfile: data.profile,
		profiles: data.profiles,
		member: data.member,
		ranks: data.ranks ?? ({} as components['schemas']['LeaderboardRanksResponse']),
	});

	let path = $derived(`/@${data.account?.name}/${data.profile?.profileName}`);

	watch.pre(
		() => data,
		(data) => {
			initStatsContext({
				account: data.account,
				selectedProfile: data.profile,
				profiles: data.profiles,
				member: data.member,
				ranks: data.ranks ?? ({} as components['schemas']['LeaderboardRanksResponse']),
			});

			if (!browser) return;

			const current = `${page.params.id}${page.params.profile ? `/${page.params.profile}` : ''}`;
			const wanted = `${data.account?.name}/${data.profile?.profileName}`;

			if (current !== wanted) {
				let newUrl = page.url.pathname.replace(current, wanted);
				tick().then(() => replaceState(newUrl, page.state));
			}
		}
	);

	const route = $derived(page.route.id?.split('/').at(-1));
</script>

<NavCrumbs account={data.account} profile={data.profile} profiles={data.profiles} />
<JoinElitePopup />

<div class="m-0 w-full p-0">
	<PlayerInfo />

	<div class="flex flex-row justify-center">
		<div class="my-6 flex w-fit flex-row justify-center rounded-md border-2 border-solid border-card p-1">
			<Button
				variant="ghost"
				size="sm"
				href="{path}/contests"
				class="{route === 'contests' ? 'bg-card' : ''} cursor-pointer">Contests</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/charts"
				class="{route === 'charts' ? 'bg-card' : ''} cursor-pointer">Charts</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href={path}
				class="{route === '[[profile]]' ? 'bg-card' : ''} cursor-pointer">Stats</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/garden"
				class="{route === 'garden' ? 'bg-card' : ''} cursor-pointer">Garden</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/rates"
				class="{route === 'rates' ? 'bg-card' : ''} cursor-pointer">Rates</Button
			>
			{#if data.authorized}
				<Button variant="ghost" size="sm" href="{path}/graphs" class="cursor-pointer">Admin</Button>
			{/if}
		</div>
	</div>

	{@render children?.()}

	<div class="my-16 flex flex-col items-center justify-center leading-none">
		<div class="flex flex-col justify-start gap-4 sm:items-center sm:justify-center">
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="select-none text-muted-foreground">Player UUID</span>
				<div class="flex flex-row items-center gap-1">
					<span class="select-all">{data.account.id}</span>
					<CopyToClipboard text={data.account.id} size="sm" class="-m-2" />
				</div>
			</div>
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="select-none text-muted-foreground">Profile UUID</span>
				<div class="flex flex-row items-center gap-1">
					<span class="select-all">{data.profile?.profileId}</span>
					<CopyToClipboard text={data.profile?.profileId} size="sm" class="-m-2" />
				</div>
			</div>
			{#if data.account?.discordId}
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="select-none text-muted-foreground">Linked Discord ID</span>
					<div class="flex flex-row items-center gap-1">
						<span class="select-all">{data.account?.discordId}</span>
						<CopyToClipboard text={data.account?.discordId} size="sm" class="-m-2" />
					</div>
				</div>
			{/if}
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="select-none text-muted-foreground">Profile Last Updated</span>
				<span class="select-all">{new Date((data.member?.lastUpdated ?? 0) * 1000).toLocaleString()}</span>
			</div>
			{#if page.url.pathname.includes('/garden')}
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="select-none text-muted-foreground">Garden Last Updated</span>
					<span class="select-all"
						>{new Date(+(data.member?.garden?.lastSave ?? 0) * 1000).toLocaleString()}</span
					>
				</div>
			{/if}
		</div>
	</div>
</div>
