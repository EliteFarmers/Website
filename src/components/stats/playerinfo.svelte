<script lang="ts">
	import type { RankName } from '$lib/skyblock';
	import { getRankDefaults } from '$lib/format';
	import { page } from '$app/stores';

	import Weight from '$comp/stats/player/weight.svelte';
	import Discord from '$comp/stats/player/discord.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import Skyblocklevel from './player/skyblocklevel.svelte';
	import type { components } from '$lib/api/api';
	import type { ProfileDetails } from '$lib/api/elite';

	export let player: components['schemas']['PlayerDataDto'] | undefined;
	export let profileDetails: ProfileDetails[];
	export let members: components['schemas']['MemberDetailsDto'][] | null | undefined;
	export let linked: string | null;
	export let weightInfo: components['schemas']['FarmingWeightDto'] | undefined;
	export let weightRank: number;
	export let skyblockXP: number;
	export let skyblockRank = -1;

	$: profiles = profileDetails.filter((p) => !$page.url.pathname.endsWith(p.name ?? ''));

	$: discordName = linked ?? player?.socialMedia?.discord;

	$: profilesData = { ign: player?.displayname ?? '', profiles: profiles, selected: profileDetails[0] };

	$: rankName =
		player?.rank ??
		(player?.monthlyPackageRank !== 'NONE' ? player?.monthlyPackageRank : player?.newPackageRank) ??
		undefined;
	$: rank = getRankDefaults(rankName as RankName);
    
    let dashId = i => i.substr(0,8)+"-"+i.substr(8,4)+"-"+i.substr(12,4)+"-"+i.substr(16,4)+"-"+i.substr(20);
    $: dashedProfileId = dashId(profileDetails[0].id);
</script>

<section class="flex justify-center w-full my-8">
	<div
		class="flex flex-col lg:flex-row justify-center items-center gap-2 lg:gap-8 p-0 sm:p-4 rounded-lg w-[98%] lg:w-[90%] lg:bg-gray-100 lg:dark:bg-zinc-800"
	>
		<div class="flex justify-center items-start gap-4 w-full p-2 sm:p-4 rounded-md bg-gray-100 dark:bg-zinc-800">
			<div class="flex justify-end">
				<img
					class="min-w-12 max-w-16 max-h-40 aspect-auto object-cover"
					src={`https://mc-heads.net/body/${player?.uuid}`}
					alt="User's Minecraft appearance"
				/>
			</div>
			<div class="flex flex-wrap xs:flex-col gap-1 justify-start items-start">
				<PlayerName
					ign={player?.displayname}
					{rank}
					members={members ?? undefined}
					profileId={profileDetails[0].id}
				/>
				<div class="flex flex-wrap md:flex-row justify-start gap-1">
					<Skyblocklevel xp={skyblockXP} rank={skyblockRank} />
					<Discord username={discordName} linked={linked !== null} />
				</div>
				<div class="flex justify-start gap-1">
					<a
						class="p-2 px-3 text-body bg-gray-200 dark:bg-zinc-700 rounded-md"
						href="https://sky.shiiyu.moe/stats/{player?.uuid}/{dashedProfileId}"
						target="_blank"
						rel="noopener noreferrer nofollow">SkyCrypt</a
					>
					<a
						class="p-2 px-3 text-body bg-gray-200 dark:bg-zinc-700 rounded-md"
						href="https://plancke.io/hypixel/player/stats/{$page.params.id}"
						target="_blank"
						rel="noopener noreferrer nofollow">Plancke</a
					>
				</div>
			</div>
		</div>
		<div class="flex justify-center lg:justify-start w-full p-2 sm:p-4 rounded-md bg-gray-100 dark:bg-zinc-800">
			<Weight weightInfo={weightInfo ?? undefined} rank={weightRank} profiles={profilesData} />
		</div>
	</div>
</section>
