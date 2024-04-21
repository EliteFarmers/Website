<script lang="ts">
	import type { RankName } from '$lib/skyblock';
	import { GetRankName, GetRankDefaults } from '$lib/format';
	import { page } from '$app/stores';

	import Weight from '$comp/stats/player/weight.svelte';
	import Discord from '$comp/stats/player/discord.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import Skyblocklevel from './player/skyblocklevel.svelte';
	import type { components } from '$lib/api/api';
	import type { ProfileDetails } from '$lib/api/elite';
	import Badge from './badge.svelte';

	export let player: components['schemas']['PlayerDataDto'] | undefined;
	export let profileDetails: ProfileDetails[];
	export let members: components['schemas']['MemberDetailsDto'][] | null | undefined;
	export let linked: string | null;
	export let weightInfo: components['schemas']['FarmingWeightDto'] | undefined;
	export let weightRank: number;
	export let skyblockXP: number;
	export let skyblockRank = -1;
	export let badges: components['schemas']['UserBadgeDto'][] | undefined;

	$: profiles = profileDetails.filter((p) => !$page.url.pathname.endsWith(p.name ?? ''));

	$: discordName = linked ?? player?.socialMedia?.discord;

	$: profilesData = { ign: player?.displayname ?? '', profiles: profiles, selected: profileDetails[0] };

	$: rankName = GetRankName(player);
	$: rank = GetRankDefaults(rankName as RankName);

	$: badgeList = badges?.filter((b) => b.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
</script>

<section class="flex flex-col align-middle w-full mt-8 items-center">
	<div class="flex gap-8 md:gap-16 flex-col md:flex-row rounded-lg bg-card p-4 md:p-8 mx-2 w-full max-w-7xl">
		<div class="flex-1 flex gap-6 flex-row justify-center md:justify-end items-center">
			<img
				class="min-w-12 max-w-16 max-h-40 aspect-auto object-cover"
				src={`https://mc-heads.net/body/${player?.uuid}`}
				alt="User's Minecraft appearance"
			/>
			<div class="flex flex-col gap-1 justify-start items-start">
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
						class="p-2 px-3 text-body bg-primary-foreground rounded-md"
						href="https://sky.shiiyu.moe/stats/{player?.uuid}/{$page.params.profile}"
						target="_blank"
						rel="noopener noreferrer nofollow">SkyCrypt</a
					>
					<a
						class="p-2 px-3 text-body bg-primary-foreground rounded-md"
						href="https://plancke.io/hypixel/player/stats/{$page.params.id}"
						target="_blank"
						rel="noopener noreferrer nofollow">Plancke</a
					>
				</div>
			</div>
		</div>
		<div class="flex-1 flex gap-6 flex-row justify-center md:justify-start items-center">
			<Weight weightInfo={weightInfo ?? undefined} rank={weightRank} profiles={profilesData} />
		</div>
	</div>
	<div class="flex flex-wrap gap-2 align-middle w-full mx-4 justify-center">
		{#each badgeList as badge (badge.id)}
			<Badge {badge} />
		{/each}
	</div>
</section>
