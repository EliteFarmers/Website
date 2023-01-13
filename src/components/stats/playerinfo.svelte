<script lang="ts">
	import type { AccountData, MemberData, PlayerInfo } from '$lib/skyblock';
	import { getRankDefaults } from '$lib/format';
	import { page } from '$app/stores';

	import Weight from '$comp/stats/player/weight.svelte';
	import Discord from '$comp/stats/player/discord.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import type { WeightInfo } from '$db/models/users';
	import Skyblocklevel from './player/skyblocklevel.svelte';

	export let account: AccountData;
	export let player: PlayerInfo;
	export let profileIds: { id: string; name: string }[];
	export let members: MemberData[] | undefined;
	export let linked: boolean;
	export let weightInfo: WeightInfo;
	export let weightRank: number;
	export let skyblockXP: number;

	const profiles = profileIds.filter((p) => !$page.url.pathname.endsWith(p.name));

	const playerData = player.player;
	const discordName = playerData.socialMedia?.links?.DISCORD;

	const profilesData = { ign: account.name, profiles: profiles, selected: profileIds[0] };

	const rankName =
		playerData.rank ??
		(playerData.monthlyPackageRank !== 'NONE' ? playerData.monthlyPackageRank : playerData.newPackageRank);
	const rank = getRankDefaults(rankName);
</script>

<section class="flex justify-center w-full my-8">
	<div
		class="flex col-span-1 flex-col md:flex-row justify-center gap-2 md:gap-8 p-0 sm:p-4 rounded-lg w-[98%] md:w-[90%] md:bg-gray-100 md:dark:bg-zinc-800"
	>
		<div class="flex justify-center gap-4 w-full p-2 sm:p-4 rounded-md bg-gray-100 dark:bg-zinc-800">
			<div>
				<img
					class="w-16 min-h-full object-cover"
					src={`https://mc-heads.net/body/${account.id}`}
					alt="User's Minecraft appearance"
				/>
			</div>
			<div class="flex flex-col gap-1 justify-start">
				<PlayerName ign={account.name} {rank} {members} profileId={profileIds[0].id} />
				<div class="flex justify-start">
					<Skyblocklevel xp={skyblockXP} />
					<Discord username={discordName} {linked} />
				</div>
				<div class="flex justify-start">
					<a
						class="p-2 px-3 mx-1 text-body bg-gray-200 dark:bg-zinc-700 rounded-md"
						href="https://sky.shiiyu.moe{$page.url.pathname}"
						target="_blank"
						rel="noopener noreferrer nofollow">SkyCrypt</a
					>
					<a
						class="p-2 px-3 mx-1 text-body bg-gray-200 dark:bg-zinc-700 rounded-md"
						href="https://plancke.io/hypixel/player/stats/{account.name}"
						target="_blank"
						rel="noopener noreferrer nofollow">Plancke</a
					>
				</div>
			</div>
		</div>
		<div class="flex justify-center lg:justify-start w-full p-2 sm:p-4 rounded-md bg-gray-100 dark:bg-zinc-800">
			<Weight {weightInfo} rank={weightRank} profiles={profilesData} />
		</div>
	</div>
</section>
