<script lang="ts">
	import { page } from '$app/state';
	import InventorySelect from '$comp/items/inventories/inventory-select.svelte';
	import SackContents from '$comp/items/sack-contents.svelte';
	import FarmingToolsAndEvents from '$comp/stats/farming-tools-and-events.svelte';
	import StatsHead from '$comp/seo/stats-head.svelte';
	import Breakdown from '$comp/stats/breakdown.svelte';
	import Collections from '$comp/stats/collections.svelte';
	import JacobInfo from '$comp/stats/jacob/jacobinfo.svelte';
	import Skills from '$comp/stats/skills.svelte';
	import { env } from '$env/dynamic/public';
	import { CROP_UNICODE_EMOJIS } from '$lib/constants/crops';
	import { buildProfilePageLdJson } from '$lib/seo/profile-page';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { createPreview } from './discord-preview';

	const ctx = getStatsContext();

	const member = $derived(ctx.member.current);
	const profile = $derived(ctx.selectedProfile);
	const uuid = $derived(ctx.uuid);
	const weightRank = $derived(ctx.allRanks?.farmingweight?.rank ?? -1);

	let weightStr = $derived(
		(
			member?.farmingWeight?.totalWeight ?? profile?.members.find((m) => m.uuid === uuid)?.farmingWeight
		)?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 'Not Found!'
	);

	const topCollections = $derived(ctx.collections?.toSorted((a, b) => b.weight - a.weight).slice(0, 3));

	const description = $derived(
		`🌾 Farming Weight - ${weightStr}` +
			`${weightRank > 0 ? ` (#${weightRank.toLocaleString()})` : ''}\n` +
			`📜 Farming Level - ${member?.stats?.skills?.levels?.farming?.level ?? 0}` +
			`${(ctx.ranks?.farming?.rank ?? -1) > 0 ? ` (#${ctx.ranks?.farming?.rank?.toLocaleString()})` : ''}\n` +
			`⠀⤷ ${(member?.skills?.farming ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Total XP\n` +
			`\n⭐ Skyblock Level - ${(member?.skyblockXp ?? 0) / 100}` +
			`${
				(ctx.ranks?.skyblockxp?.rank ?? -1) > 0 ? ` (#${ctx.ranks?.skyblockxp?.rank?.toLocaleString()})` : ''
			}\n\n` +
			(topCollections
				.map((c) => {
					const crop = getCropFromName(c.key) ?? Crop.Wheat;
					const rank = ctx.ranks?.[c.key]?.rank ?? -1;

					return (
						`${CROP_UNICODE_EMOJIS[crop]} ${getCropDisplayName(crop)} - ${c.value.toLocaleString()}` +
						`${rank > 0 ? ` (#${rank.toLocaleString()})` : ''}`
					);
				})
				.join('\n') ?? '')
	);

	const canonicalPath = $derived(`/@${ctx.ign ?? ''}/${encodeURIComponent(profile?.profileName ?? '')}`);
	const canonicalRoot = $derived(env.PUBLIC_CANONICAL_URL || env.PUBLIC_HOST_URL || page.url.origin);
	const canonicalUrl = $derived.by(
		() => `${canonicalRoot}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`
	);

	const profileTitle = $derived(`${ctx.ignMeta} (${profile?.profileName}) | Stats`);
	const ldJson = $derived.by(() =>
		buildProfilePageLdJson({
			title: profileTitle,
			description,
			url: canonicalUrl,
			ign: ctx.ign ?? undefined,
			ignMeta: ctx.ignMeta ?? undefined,
			uuid: uuid ?? undefined,
			profileName: profile?.profileName ?? undefined,
			profileId: profile?.profileId ?? undefined,
			gameMode: profile?.gameMode ?? undefined,
		})
	);
</script>

<StatsHead
	discordPreview={ctx.account
		? createPreview(
				{ account: ctx.account, profile: ctx.selectedProfile, member: ctx.member.current, ranks: ctx.allRanks },
				page.url,
				description
			)
		: undefined}
	title="Stats"
	{description}
	canonicalPath="/@{ctx.ign}/{encodeURIComponent(profile?.profileName ?? '')}"
	{ldJson}
	keywords="farming, skyblock profile, skyblock, Hypixel, elite skyblock, elite farmers"
/>

<Skills />

<section class="my-8 flex w-full justify-center align-middle">
	<div class="mx-2 flex w-full max-w-7xl flex-col justify-center gap-8 align-middle lg:flex-row">
		<Collections />
		<FarmingToolsAndEvents />
	</div>
</section>

<InventorySelect />
<SackContents />
<JacobInfo />
<Breakdown />
