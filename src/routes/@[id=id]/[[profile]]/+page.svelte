<script lang="ts">
	import { page } from '$app/stores';

	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import { CROP_UNICODE_EMOJIS } from '$lib/constants/crops';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	import Skills from '$comp/stats/skills.svelte';
	import Collections from '$comp/stats/collections.svelte';
	import APIstatus from '$comp/stats/apistatus.svelte';
	import Breakdown from '$comp/stats/breakdown.svelte';
	import JacobInfo from '$comp/stats/jacob/jacobinfo.svelte';
	import Farmingtools from '$comp/items/tools/farmingtools.svelte';
	import ProfileEventMember from '$comp/events/profile-event-member.svelte';
	import Head from '$comp/head.svelte';

	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let collections = $derived(data.collections);
	let member = $derived(data.member);
	let profile = $derived(data.profile);
	let uuid = $derived(data.account?.id);
	let ign = $derived(data.account?.name);
	let weightRank = $derived(data.ranks?.misc?.farmingweight ?? -1);

	let farmingXp = $derived(
		getLevelProgress(
			'farming',
			member?.skills?.farming ?? 0,
			(member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		)
	);

	let showSkills = $state($page.url.href.includes('#Skills'));

	let weightStr = $derived(
		member?.farmingWeight?.totalWeight?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 'Not Found!'
	);

	let description = $derived(
		`🌾 Farming Weight - ${weightStr}` +
			`${weightRank > 0 ? ` (#${weightRank})` : ''}\n` +
			`📜 Farming Level - ${farmingXp.level}` +
			`${(data.ranks?.skills?.farming ?? -1) > 0 ? ` (#${data.ranks?.skills?.farming?.toLocaleString()})` : ''}\n` +
			`⠀⤷ ${(member?.skills?.farming ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Total XP\n` +
			`\n⭐ Skyblock Level - ${(member?.skyblockXp ?? 0) / 100}` +
			`${
				(data.ranks?.misc?.skyblockxp ?? -1) > 0 ? ` (#${data.ranks?.misc?.skyblockxp?.toLocaleString()})` : ''
			}\n\n` +
			(collections
				?.sort((a, b) => b.weight - a.weight)
				.slice(0, 3)
				.map((c) => {
					const crop = getCropFromName(c.key) ?? Crop.Wheat;
					const rank = data.ranks?.collections?.[c.key] ?? -1;

					return (
						`${CROP_UNICODE_EMOJIS[crop]} ${getCropDisplayName(crop)} - ${c.value.toLocaleString()}` +
						`${rank > 0 ? ` (#${rank.toLocaleString()})` : ''}`
					);
				})
				.join('\n') ?? '')
	);
</script>

<Head
	title="{ign} ({profile?.profileName}) | Farming Weight"
	{description}
	imageUrl="https://mc-heads.net/head/{uuid}/left.png"
>
	<link rel="preload" href="/images/cropatlas.webp" as="image" />
</Head>

<APIstatus api={member?.api} />

<section class="my-2 mb-16 flex items-center justify-center" id="Skills">
	<div class="flex w-full max-w-7xl flex-1">
		<Skills
			bind:open={showSkills}
			skills={data.member.skills}
			ranks={data.ranks}
			levelCaps={member?.unparsed?.levelCaps}
			gardenXp={member?.garden?.experience ?? 0}
		/>
	</div>
</section>

<section class="my-8 flex w-full justify-center align-middle">
	<div class="mx-2 flex w-full max-w-7xl flex-col justify-center gap-8 align-middle lg:flex-row">
		<Collections collections={data.collections} ranks={data.ranks ?? {}} />
		{#if member?.farmingWeight?.inventory?.tools?.length || member?.events?.length}
			<div class="flex flex-1 flex-col gap-2">
				{#each member?.events ?? [] as event (event.eventId)}
					<ProfileEventMember member={event} ign={ign || ''} memberUuid={uuid ?? ''} />
				{/each}
				<Farmingtools
					garden={member?.garden}
					tools={member?.farmingWeight?.inventory?.tools ?? []}
					pets={member?.pets ?? []}
					shown={10 - (member?.events?.length ?? 0)}
				/>
			</div>
		{/if}
	</div>
</section>

<JacobInfo
	jacob={member?.jacob}
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

<Breakdown weight={member?.farmingWeight} />
