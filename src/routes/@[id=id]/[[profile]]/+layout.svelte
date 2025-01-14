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

	function active(path: string) {
		if (!url.endsWith(path)) return '';
		return 'text-red-700 dark:text-red-600';
	}
</script>

<NavCrumbs account={data.account} profile={data.profile} />

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
