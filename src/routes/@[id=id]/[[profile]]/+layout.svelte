<script lang="ts">
	import type { LayoutData } from './$types';
	import PlayerInfo from '$comp/stats/playerinfo.svelte';
	import { browser } from '$app/environment';
	import { Button } from '$ui/button';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import { tick, type Snippet } from 'svelte';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import Gamemode from '$comp/stats/player/gamemode.svelte';
	import type { ProfileGameMode } from '$lib/api/elite';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let path = $derived(`/@${data.account?.name}/${data.profile?.profileName}`);
	let url = $derived(page.url.pathname);
	const otherMembers = $derived(data.profile?.members?.filter((m) => m.uuid !== data.account?.id && m.active));

	$effect(() => {
		if (!browser) return;

		const current = `${page.params.id}${page.params.profile ? `/${page.params.profile}` : ''}`;
		const wanted = `${data.account?.name}/${data.profile?.profileName}`;

		if (current !== wanted) {
			let newUrl = page.url.pathname.replace(current, wanted);
			tick().then(() => replaceState(newUrl, page.state));
		}
	});

	const lastPath = $derived(page.url.pathname.split('/').at(-1));
	const subPages = $derived([
		{
			name: 'stats',
			href: path,
		},
		{
			name: 'contests',
			href: `${path}/contests`,
		},
		{
			name: 'charts',
			href: `${path}/charts`,
		},
		{
			name: 'garden',
			href: `${path}/garden`,
		},
		{
			name: 'rates',
			href: `${path}/rates`,
		},
	]);
	const subPage = $derived(subPages.find((subPages) => subPages.name === lastPath)?.name ?? 'stats');

	const crumbs = $derived<Crumb[]>([
		{
			name: data.account?.name,
			dropdown: otherMembers?.map((m) => ({
				name: m.username,
				href: `/@${m.username}/${data.profile?.profileId}`,
				data: {
					uuid: m.uuid,
					weight: m.farmingWeight?.toString(),
				},
				snippet: memberDropdown,
			})),
			data: {
				uuid: data.account?.id,
			},
			snippet: memberDropdown,
		},
		{
			name: data.profile?.profileName,
			dropdown: data.profiles?.slice(1).map((p) => ({
				name: p.name,
				href: `/@${data.account?.name}/${p.name}`,
				data: {
					mode: p.gameMode,
				},
				snippet: profileDropdown,
			})),
			data: {
				mode: data.profile?.gameMode,
			},
			snippet: profileDropdown,
		},
		{
			name: subPage,
			dropdown: [
				{
					name: 'Stats',
					href: path,
				},
				{
					name: 'Contests',
					href: `${path}/contests`,
				},
				{
					name: 'Charts',
					href: `${path}/charts`,
				},
				{
					name: 'Garden',
					href: `${path}/garden`,
				},
				{
					name: 'Rates',
					href: `${path}/rates`,
				},
			],
		},
	]);

	$inspect(page.url.pathname);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});

	function active(path: string) {
		if (!url.endsWith(path)) return '';
		return 'text-red-700 dark:text-red-600';
	}
</script>

<div class="m-0 w-full p-0">
	<PlayerInfo
		player={data.account?.playerData}
		members={otherMembers}
		profileDetails={data.profiles ?? []}
		linked={data.account?.discordUsername ?? null}
		weightInfo={data.member?.farmingWeight}
		weightRank={data.ranks?.misc?.farmingweight ?? -1}
		skyblockXP={data.member?.skyblockXp ?? 0}
		skyblockRank={data.ranks?.misc?.skyblockxp ?? -1}
		badges={data.account?.badges}
	/>

	<div class="flex flex-row justify-center">
		{#key url}
			<div
				class="my-6 flex w-fit flex-row justify-center rounded-md border-2 border-solid border-primary-foreground p-1"
			>
				<Button variant="ghost" size="sm" href="{path}/contests" class={active('/contests') + ' cursor-pointer'}
					>Contests</Button
				>
				<Button variant="ghost" size="sm" href="{path}/charts" class={active('/charts') + ' cursor-pointer'}
					>Charts</Button
				>
				<Button variant="ghost" size="sm" href={path} class={active(path) + ' cursor-pointer'}>Stats</Button>
				<Button variant="ghost" size="sm" href="{path}/garden" class={active('/garden') + ' cursor-pointer'}
					>Garden</Button
				>
				<Button variant="ghost" size="sm" href="{path}/rates" class={active('/rates') + ' cursor-pointer'}
					>Rates</Button
				>
				{#if data.authorized}
					<Button variant="ghost" size="sm" href="{path}/graphs" class="cursor-pointer">Admin</Button>
				{/if}
			</div>
		{/key}
	</div>

	{@render children?.()}

	<div class="my-16 flex flex-col items-center justify-center leading-none">
		<div class="flex flex-col justify-start gap-4 sm:items-center sm:justify-center">
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="select-none text-gray-500">Player UUID</span>
				<div class="flex flex-row items-center gap-1">
					<span class="select-all">{data.account.id}</span>
					<CopyToClipboard text={data.account.id} size="sm" class="-m-2" />
				</div>
			</div>
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="select-none text-gray-500">Profile UUID</span>
				<div class="flex flex-row items-center gap-1">
					<span class="select-all">{data.profile?.profileId}</span>
					<CopyToClipboard text={data.profile?.profileId} size="sm" class="-m-2" />
				</div>
			</div>
			{#if data.account?.discordId}
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="select-none text-gray-500">Linked Discord ID</span>
					<div class="flex flex-row items-center gap-1">
						<span class="select-all">{data.account?.discordId}</span>
						<CopyToClipboard text={data.account?.discordId} size="sm" class="-m-2" />
					</div>
				</div>
			{/if}
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<span class="select-none text-gray-500">Profile Last Updated</span>
				<span class="select-all">{new Date((data.member?.lastUpdated ?? 0) * 1000).toLocaleString()}</span>
			</div>
			{#if page.url.pathname.includes('/garden')}
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="select-none text-gray-500">Garden Last Updated</span>
					<span class="select-all"
						>{new Date(+(data.member?.garden?.lastSave ?? 0) * 1000).toLocaleString()}</span
					>
				</div>
			{/if}
		</div>
	</div>
</div>

{#snippet memberDropdown(crumb?: Crumb | Omit<Crumb, 'dropdown'>)}
	<div class="flex max-w-md flex-row items-center justify-between gap-2">
		<div class="flex w-full flex-1 flex-row items-center gap-2">
			<img
				src="https://mc-heads.net/avatar/{crumb?.data?.uuid ?? ''}"
				alt="Player Head"
				class="aspect-square size-6 rounded-sm"
			/>
			<span class="font-semibold">{crumb?.name}</span>
		</div>
		{#if crumb?.data?.weight}
			<span>{(+crumb?.data?.weight).toLocaleString()}</span>
		{/if}
	</div>
{/snippet}

{#snippet profileDropdown(crumb?: Crumb | Omit<Crumb, 'dropdown'>)}
	<div class="flex max-w-md flex-row items-center justify-between gap-2">
		<span class="font-semibold">{crumb?.name}</span>
		{#if crumb?.data?.mode}
			<Gamemode
				class="max-size-fit"
				gameMode={(crumb?.data?.mode ?? 'classic') as ProfileGameMode}
				popover={false}
			/>
		{/if}
	</div>
{/snippet}
