<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import { CROP_UNICODE_EMOJIS } from '$lib/constants/crops';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	import Skills from '$comp/stats/skills.svelte';
	import Skillbar from '$comp/stats/skillbar.svelte';
	import Collections from '$comp/stats/collections.svelte';
	import APIstatus from '$comp/stats/apistatus.svelte';
	import Breakdown from '$comp/stats/breakdown.svelte';
	import JacobInfo from '$comp/stats/jacob/jacobinfo.svelte';
	import Farmingtools from '$comp/items/tools/farmingtools.svelte';
	import ProfileEventMember from '$comp/events/profile-event-member.svelte';
	import Head from '$comp/head.svelte';

	import type { PageData } from './$types';
	export let data: PageData;

	$: uuid = data.account?.id;
	$: ign = data.account?.name;
	$: collections = data.collections;
	$: weightRank = data.ranks?.misc?.farmingweight ?? -1;
	$: profile = data.profile;
	$: member = data.member ?? {};

	$: farmingXp = getLevelProgress(
		'farming',
		member.skills?.farming ?? 0,
		(member.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
	);
	$: showSkills = $page.url.href.includes('#Skills');

	$: weightStr =
		member.farmingWeight?.totalWeight?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 'Not Found!';

	$: description =
		`🌾 Farming Weight - ${weightStr}` +
		`${weightRank > 0 ? ` (#${weightRank})` : ''}\n` +
		`📜 Farming Level - ${farmingXp.level}` +
		`${(data.ranks?.skills?.farming ?? -1) > 0 ? ` (#${data.ranks?.skills?.farming?.toLocaleString()})` : ''}\n` +
		`⠀⤷ ${(member.skills?.farming ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Total XP\n` +
		`\n⭐ Skyblock Level - ${(member.skyblockXp ?? 0) / 100}` +
		`${
			(data.ranks?.misc?.skyblockxp ?? -1) > 0 ? ` (#${data.ranks?.misc?.skyblockxp?.toLocaleString()})` : ''
		}\n\n` +
		data.collections
			.sort((a, b) => b.weight - a.weight)
			.slice(0, 3)
			.map((c) => {
				const crop = getCropFromName(c.key) ?? Crop.Wheat;
				const rank = data.ranks?.collections?.[c.key] ?? -1;

				return (
					`${CROP_UNICODE_EMOJIS[crop]} ${getCropDisplayName(crop)} - ${c.value.toLocaleString()}` +
					`${rank > 0 ? ` (#${rank.toLocaleString()})` : ''}`
				);
			})
			.join('\n');
</script>

<Head
	title="{ign} ({profile.profileName}) | Farming Weight"
	{description}
	imageUrl="https://mc-heads.net/head/{uuid}/left.png"
>
	<link rel="preload" href="/images/cropatlas.webp" as="image" />
</Head>

<APIstatus api={member.api} />

<section class="flex items-center justify-center w-full mt-2 mb-20">
	<div class="flex w-[90%] lg:w-2/3 align-middle justify-center justify-self-center mx-2">
		<div class="w-[90%]">
			<Skillbar name="Farming" progress={farmingXp} rank={data.ranks?.skills?.farming} />
		</div>
		<div class="w-[10%]">
			<!-- Collapse/expand button -->
			<button
				class="flex justify-center align-middle items-center w-full lg:h-16 h-full lg:p-4 bg-gray-200 dark:bg-zinc-800 rounded-lg"
				on:click={() => {
					showSkills = !showSkills;
				}}
			>
				<svg class="w-6 h-6 lg:w-full lg:h-full" viewBox="0 0 24 24">
					{#if showSkills}
						<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
					{:else}
						<path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
					{/if}
				</svg>
			</button>
		</div>
	</div>
</section>

{#if showSkills}
	<div class="flex justify-center w-full mb-4 -mt-8" transition:slide={{ duration: 1000, easing: quadInOut }}>
		<div class="block w-[90%] mb-4">
			<Skills skills={member.skills} skillRanks={data.ranks?.skills} />
		</div>
	</div>
{/if}

<section class="flex w-full justify-center align-middle my-8">
	<div class="flex flex-col lg:flex-row gap-8 max-w-7xl w-full justify-center align-middle mx-2">
		<Collections {collections} ranks={data.ranks ?? {}} />
		{#if member.farmingWeight?.inventory?.tools?.length || member.events?.length}
			<div class="flex flex-1 flex-col gap-2">
				{#each member.events ?? [] as event (event.eventId)}
					<ProfileEventMember member={event} ign={ign || ''} />
				{/each}
				<Farmingtools
					tools={member.farmingWeight?.inventory?.tools ?? []}
					shown={10 - (member.events?.length ?? 0)}
				/>
			</div>
		{/if}
	</div>
</section>

<JacobInfo
	jacob={member.jacob}
	ign={data.account?.name ?? ''}
	ranks={{
		gold: data.ranks?.misc?.goldmedals ?? -1,
		silver: data.ranks?.misc?.silvermedals ?? -1,
		bronze: data.ranks?.misc?.bronzemedals ?? -1,
		platinum: data.ranks?.misc?.platinummedals ?? -1,
		diamond: data.ranks?.misc?.diamondmedals ?? -1,
		participations: data.ranks?.misc?.participations ?? -1,
		firstPlaces: data.ranks?.misc?.firstplace ?? -1,
	}}
/>

<Breakdown weight={member.farmingWeight} />
