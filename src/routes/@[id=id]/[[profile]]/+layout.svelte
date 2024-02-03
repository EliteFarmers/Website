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
	/>

	{#key url}
		<div class="flex flex-row w-full justify-center mx-2 my-4">
			<Menubar.Root class="font-semibold max-w-xl justify-center">
				<Menubar.Menu>
					<Menubar.Item href="{path}/contests" class={active('/contests')}
						>All Contests</Menubar.Item
					>
					<Menubar.Item href={path} class={active(path)}>Stats</Menubar.Item>
					<Menubar.Item href="{path}/rates" class={active('/rates')}
						>Rate Calculator</Menubar.Item
					>
					{#if data.authorized}
						<Menubar.Item href="{path}/graphs">Admin</Menubar.Item>
					{/if}
				</Menubar.Menu>
			</Menubar.Root>
		</div>
	{/key}

	<slot />
</main>
