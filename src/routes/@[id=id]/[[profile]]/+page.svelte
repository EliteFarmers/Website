<script lang="ts">
	import { page } from '$app/state';
	import { getStatsContext } from '$lib/stores/stats.svelte';
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
	import CropStats from '$comp/stats/jacob/crop-stats.svelte';
	import Head from '$comp/head.svelte';

	const ctx = getStatsContext();

	const member = $derived(ctx.member);
	const profile = $derived(ctx.selectedProfile);
	const uuid = $derived(ctx.uuid);
	const ign = $derived(ctx.ign);
	const weightRank = $derived(ctx.ranks?.misc?.farmingweight ?? -1);

	let farmingXp = $derived(
		getLevelProgress(
			'farming',
			member?.skills?.farming ?? 0,
			(member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		)
	);

	let showSkills = $state(page.url.href.includes('#Skills'));

	let weightStr = $derived(
		member?.farmingWeight?.totalWeight?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 'Not Found!'
	);

	const topCollections = $derived(ctx.collections?.toSorted((a, b) => b.weight - a.weight).slice(0, 3));
	const topCrop = $derived(getCropDisplayName(getCropFromName(topCollections?.[0]?.key ?? 'Wheat') ?? Crop.Wheat));

	let description = $derived(
		`🌾 Farming Weight - ${weightStr}` +
			`${weightRank > 0 ? ` (#${weightRank})` : ''}\n` +
			`📜 Farming Level - ${farmingXp.level}` +
			`${(ctx.ranks?.skills?.farming ?? -1) > 0 ? ` (#${ctx.ranks?.skills?.farming?.toLocaleString()})` : ''}\n` +
			`⠀⤷ ${(member?.skills?.farming ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Total XP\n` +
			`\n⭐ Skyblock Level - ${(member?.skyblockXp ?? 0) / 100}` +
			`${
				(ctx.ranks?.misc?.skyblockxp ?? -1) > 0 ? ` (#${ctx.ranks?.misc?.skyblockxp?.toLocaleString()})` : ''
			}\n\n` +
			(topCollections
				.map((c) => {
					const crop = getCropFromName(c.key) ?? Crop.Wheat;
					const rank = ctx.ranks?.collections?.[c.key] ?? -1;

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

<APIstatus />

<section class="my-2 mb-16 flex items-center justify-center" id="Skills">
	<div class="flex w-full max-w-7xl flex-1">
		<Skills bind:open={showSkills} />
	</div>
</section>

<section class="my-8 flex w-full justify-center align-middle">
	<div class="mx-2 flex w-full max-w-7xl flex-col justify-center gap-8 align-middle lg:flex-row">
		<Collections />
		{#if member?.farmingWeight?.inventory?.tools?.length || member?.events?.length}
			<div class="flex flex-1 flex-col gap-2">
				{#each member?.events ?? [] as event (event.eventId)}
					<ProfileEventMember member={event} ign={ign || ''} memberUuid={uuid ?? ''} />
				{/each}
				<Farmingtools />
			</div>
		{/if}
	</div>
</section>

<JacobInfo />

<div class="my-8 flex flex-col items-center justify-center">
	<div class="flex max-w-4xl flex-col gap-8">
		<CropStats jacob={member.jacob} crop={topCrop} />
		<Breakdown weight={member.farmingWeight} />
	</div>
</div>
