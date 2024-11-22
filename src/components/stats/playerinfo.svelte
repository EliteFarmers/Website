<script lang="ts">
	import type { RankName } from '$lib/skyblock';
	import type { components } from '$lib/api/api';
	import type { ProfileDetails } from '$lib/api/elite';
	import { GetRankName, GetRankDefaults } from '$lib/format';
	import { page } from '$app/stores';

	import Weight from '$comp/stats/player/weight.svelte';
	import Discord from '$comp/stats/player/discord.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import Skyblocklevel from './player/skyblocklevel.svelte';
	import * as Popover from '$ui/popover';
	import Badge from './badge.svelte';
	import { OTHER_SITES } from '$content/othersites';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	interface Props {
		player: components['schemas']['PlayerDataDto'] | undefined;
		profileDetails: ProfileDetails[];
		members: components['schemas']['MemberDetailsDto'][] | null | undefined;
		linked: string | null;
		weightInfo: components['schemas']['FarmingWeightDto'] | undefined;
		weightRank: number;
		skyblockXP: number;
		skyblockRank?: number;
		badges: components['schemas']['UserBadgeDto'][] | undefined;
	}

	let {
		player,
		profileDetails,
		members,
		linked,
		weightInfo,
		weightRank,
		skyblockXP,
		skyblockRank = -1,
		badges,
	}: Props = $props();

	let profiles = $derived(profileDetails.filter((p) => !$page.url.pathname.endsWith(p.name ?? '')));

	let discordName = $derived(linked ?? player?.socialMedia?.discord);

	let profilesData = $derived({ ign: player?.displayname ?? '', profiles: profiles, selected: profileDetails[0] });

	let rankName = $derived(GetRankName(player));
	let rank = $derived(GetRankDefaults(rankName as RankName));

	let badgeList = $derived(badges?.filter((b) => b.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? []);
</script>

<section class="mt-8 flex w-full flex-col items-center align-middle">
	<div class="mx-2 flex w-full max-w-7xl flex-col gap-8 rounded-lg bg-card p-4 md:flex-row md:gap-16 md:p-8">
		<div class="flex flex-1 flex-row items-center justify-center gap-6 md:justify-end">
			<img
				class="aspect-auto max-h-40 min-w-12 max-w-16 object-cover"
				src={`https://mc-heads.net/body/${player?.uuid}`}
				alt="User's Minecraft appearance"
			/>
			<div class="flex flex-col items-start justify-start gap-1">
				<PlayerName
					ign={player?.displayname}
					{rank}
					members={members ?? undefined}
					profileId={profileDetails[0]?.id}
				/>
				<div class="flex flex-wrap justify-start gap-1 md:flex-row">
					<Skyblocklevel xp={skyblockXP} rank={skyblockRank} />
					<Discord username={discordName} linked={linked !== null} />
				</div>
				<div class="flex justify-start gap-1">
					<Popover.Mobile>
						{#snippet trigger()}
							<div class="rounded-md bg-primary-foreground">
								<p class="p-2 px-2">External Sites</p>
							</div>
						{/snippet}
						<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
							{#each OTHER_SITES as site (site.name)}
								<a
									href={site.url(player?.uuid ?? $page.params.id, $page.params.profile)}
									class="flex flex-row items-center justify-between gap-2 rounded-md p-2 px-3 hover:bg-primary-foreground"
									target="_blank"
									rel="noopener noreferrer nofollow"
								>
									<p>
										{site.name}
									</p>
									<ExternalLink size={16} />
								</a>
							{/each}
						</div>
					</Popover.Mobile>
				</div>
			</div>
		</div>
		<div class="flex flex-1 flex-row items-center justify-center gap-6 md:justify-start">
			<Weight weightInfo={weightInfo ?? undefined} rank={weightRank} profiles={profilesData} />
		</div>
	</div>
	<div class="mx-4 flex w-full flex-wrap justify-center gap-2 align-middle">
		{#each badgeList as badge (badge.id)}
			<Badge {badge} />
		{/each}
	</div>
</section>
