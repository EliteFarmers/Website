<script lang="ts">
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import APIstatus from '$comp/stats/apistatus.svelte';
	import BadgeList from '$comp/stats/namecard/badge-list.svelte';
	import NameCard from '$comp/stats/namecard/name-card.svelte';
	import JoinElitePopup from '$comp/stats/player/join-elite-popup.svelte';
	import { initStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import { watch } from 'runed';
	import { tick, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import NavCrumbs from './nav-crumbs.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const ctx = initStatsContext({
		account: data.account,
		selectedProfile: data.profile,
		profiles: data.profiles,
		style: data.style,
	});

	let path = $derived(`/@${data.account?.name}/${data.profile?.profileName}`);

	watch.pre(
		() => data,
		(data) => {
			initStatsContext({
				account: data.account,
				selectedProfile: data.profile,
				profiles: data.profiles,
				style: data.style,
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
	<NameCard />
	<BadgeList />

	{@render pagenav()}

	<APIstatus />

	{@render children?.()}

	{@render pagenav()}

	<div class="my-16 flex flex-col items-center justify-center leading-none">
		<div class="flex flex-col justify-start gap-4 sm:items-center sm:justify-center">
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="text-muted-foreground select-none">Player UUID</span>
				<div class="flex flex-row items-center gap-1">
					<span class="select-all">{data.account.id}</span>
					<CopyToClipboard text={data.account.id} class="-my-2 size-8" />
				</div>
			</div>
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="text-muted-foreground select-none">Profile UUID</span>
				<div class="flex flex-row items-center gap-1">
					<span class="select-all">{data.profile?.profileId}</span>
					<CopyToClipboard text={data.profile?.profileId} class="-my-2 size-8" />
				</div>
			</div>
			{#if data.account?.discordId}
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="text-muted-foreground select-none">Linked Discord ID</span>
					<div class="flex flex-row items-center gap-1">
						<span class="select-all">{data.account?.discordId}</span>
						<CopyToClipboard text={data.account?.discordId} class="-my-2 size-8" />
					</div>
				</div>
			{/if}
			{#if ctx.member.current}
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="text-muted-foreground select-none">Profile Last Updated</span>
					<span class="select-all"
						>{new Date(Number(ctx.member.current?.lastUpdated ?? 0) * 1000).toLocaleString()}</span
					>
				</div>
				{#if page.url.pathname.includes('/garden')}
					<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
						<span class="text-muted-foreground select-none">Garden Last Updated</span>
						<span class="select-all"
							>{new Date(+(ctx.member.current?.garden?.lastSave ?? 0) * 1000).toLocaleString()}</span
						>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

{#snippet pagenav()}
	<div class="flex flex-row justify-center">
		<div class="my-6 flex max-w-fit flex-wrap justify-center rounded-md border border-solid p-1 sm:flex-row">
			<Button
				variant="ghost"
				size="sm"
				href="{path}/contests"
				class="{route === 'contests' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Contests</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/charts"
				class="{route === 'charts' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Charts</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href={path}
				class="{route === '[[profile]]' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Stats</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/garden"
				class="{route === 'garden' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Garden</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/fortune"
				class="{route === 'fortune' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Fortune</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/ranks"
				class="{route === 'ranks' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Ranks</Button
			>
			{#if data.authorized}
				<Button variant="ghost" size="sm" href="{path}/graphs" class="w-1/3 cursor-pointer sm:w-auto"
					>Admin</Button
				>
			{/if}
		</div>
	</div>
{/snippet}
