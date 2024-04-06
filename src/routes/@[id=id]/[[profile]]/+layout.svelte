<script lang="ts">
	import type { LayoutData } from './$types';
	import PlayerInfo from '$comp/stats/playerinfo.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import * as Menubar from '$ui/menubar';
	import { goto } from '$app/navigation';

	export let data: LayoutData;

	$: path = `/@${data.account?.name}/${data.profile?.profileName}`;
	$: updateUrl($page.params);

	$: url = $page.url.pathname;

	function updateUrl(params = $page.params) {
		if (!browser) return;

		const current = `${params.id}${params.profile ? `/${params.profile}` : ''}`;
		const wanted = `${data.account?.name}/${data.profile?.profileName}`;

		if (current !== wanted) {
			url = $page.url.pathname.replace(current, wanted);
			goto(url, { replaceState: true });
		}
	}

	function active(path: string) {
		if (!url.endsWith(path)) return '';
		return 'text-red-700 dark:text-red-600';
	}
</script>

<main class="m-0 p-0 w-full">
	<PlayerInfo
		player={data.account?.playerData}
		members={data.profile?.members?.filter((m) => m.uuid !== data.account?.id)}
		profileDetails={data.profiles ?? []}
		linked={data.account?.discordUsername ?? null}
		weightInfo={data.member?.farmingWeight}
		weightRank={data.ranks?.misc?.farmingweight ?? -1}
		skyblockXP={data.member?.skyblockXp ?? 0}
		skyblockRank={data.ranks?.misc?.skyblockxp ?? -1}
		badges={data.account.badges}
	/>

	{#key url}
		<div class="flex flex-row w-full justify-center my-4">
			<Menubar.Root class="font-semibold max-w-xl justify-center mx-2">
				<Menubar.Menu>
					<Menubar.Item href="{path}/contests" class={active('/contests') + ' cursor-pointer'}
						>All Contests</Menubar.Item
					>
					<Menubar.Item href={path} class={active(path) + ' cursor-pointer'}>Stats</Menubar.Item>
					<Menubar.Item href="{path}/rates" class={active('/rates') + ' cursor-pointer'}
						>Rate Calculator</Menubar.Item
					>
					<Menubar.Item href="{path}/charts" class={active('/charts') + ' cursor-pointer'}
						>Charts</Menubar.Item
					>
					{#if data.authorized}
						<Menubar.Item href="{path}/graphs" class="cursor-pointer">Admin</Menubar.Item>
					{/if}
				</Menubar.Menu>
			</Menubar.Root>
		</div>
	{/key}

	<slot />

	<div class="text-center text-md my-16 flex flex-col justify-center w-full">
		<p>
			<span class="select-none text-gray-500">Player UUID:</span>
			<span class="select-all">{data.account.id}</span>
		</p>
		<p>
			<span class="select-none text-gray-500">Profile UUID:</span>
			<span class="select-all">{data.profile?.profileId}</span>
		</p>
		<p>
			<span class="select-none text-gray-500">Last Updated:</span>
			{new Date((data.member?.lastUpdated ?? 0) * 1000).toLocaleString()}
		</p>
	</div>
</main>
