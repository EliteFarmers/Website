<script lang="ts">
	import type { LayoutData } from './$types';
	import PlayerInfo from '$comp/stats/playerinfo.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { NavLi, NavUl, Navbar } from 'flowbite-svelte';

	export let data: LayoutData;

	$: path = `/@${data.account.name}/${data.profile.profileName}`;
	$: updateUrl($page.params);

	$: url = $page.url.pathname;

	function updateUrl(params = $page.params) {
		if (!browser) return;

		const current = `${params.id}${params.profile ? `/${params.profile}` : ''}`;
		const wanted = `${data.account.name}/${data.profile.profileName}`;

		if (current !== wanted) {
			url = $page.url.pathname.replace(current, wanted);
			history.replaceState(history.state, document.title, $page.url.href.replace(current, wanted));
		}
	}
</script>

<main class="m-0 p-0 w-full">
	<PlayerInfo
		player={data.account.playerData}
		members={data.profile.members?.filter((m) => m.uuid !== data.account.id)}
		profileDetails={data.profiles}
		linked={data.account.discordUsername ?? null}
		weightInfo={data.member.farmingWeight}
		weightRank={data.ranks?.misc?.farmingweight ?? -1}
		skyblockXP={data.member.skyblockXp ?? 0}
		skyblockRank={data.ranks?.misc?.skyblockxp ?? -1}
	/>

	{#key url}
		<Navbar rounded color="none" classNavDiv="flex justify-center">
			<NavUl
				class="flex lg:order-3 mx-auto justify-center lg:mx-0 md:items-center my-2"
				ulClass="flex p-4 gap-4 flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:items-center justify-between bg-gray-100 dark:bg-zinc-800 rounded-md border-none max-w-xl w-full"
				activeClass="text-red-600 dark:text-red-500 flex-1"
				nonActiveClass="flex-1"
				hidden={false}
				color="none"
			>
				<NavLi href="{path}/contests" active={url.endsWith('/contests')}>All Contests</NavLi>
				<NavLi href={path} active={url === path}>Stats</NavLi>
				<NavLi href="{path}/rates" active={url.endsWith('/rates')}>Rate Calculator</NavLi>
			</NavUl>
		</Navbar>
	{/key}

	<slot />
</main>
