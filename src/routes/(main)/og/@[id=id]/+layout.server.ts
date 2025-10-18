import { dev } from '$app/environment';
import { getAccount, getPlayerLeaderboardRanks, getProfile } from '$lib/api';
import { type ProfileDetails, type ProfileGameMode } from '$lib/api/elite';
import { CROP_UNICODE_EMOJIS } from '$lib/constants/crops';
import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
import { getLevelProgress } from '$lib/format';
import { PlayerStats } from '$lib/stores/stats.svelte';
import { error, redirect } from '@sveltejs/kit';
import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals, url }) => {
	const { id, profile } = params;

	if (!locals.bot && !dev) {
		throw redirect(307, `/@${params.id}${params.profile ? `/${params.profile}` : ''}`);
	}

	const { data: account } = await getAccount(id.replaceAll('-', ''));

	if (!account?.id || !account.name) {
		throw error(404, 'Player not found');
	}

	const profiles = account.profiles?.filter((p) => p.members?.some((m) => m.uuid === account.id && m.active));

	if (!profiles?.length) {
		throw error(404, 'No profiles found for ' + account.name);
	}

	const selectedProfile = profile
		? (profiles.find(
				(p) =>
					p.profileId === profile.replaceAll('-', '') ||
					p.profileName?.toUpperCase() === profile.toUpperCase()
			) ?? profiles[0])
		: (profiles.find((p) => p.selected) ?? profiles[0]);

	if (!selectedProfile.profileId || !selectedProfile.profileName) {
		throw error(404, 'Profile not found');
	}

	if (!profile) {
		throw redirect(307, url.pathname.replace(id, id + '/' + selectedProfile.profileName));
	}

	const profileIds: ProfileDetails[] = profiles
		// Filter out the current profile
		.filter((p) => p.profileId !== selectedProfile.profileId)
		.map((p) => ({
			id: p.profileId ?? 'Unknown',
			name: p.profileName ?? 'Unknown',
			selected: p.selected ?? false,
			gameMode: p.gameMode as ProfileGameMode | undefined,
			weight: p.members?.find((m) => m.uuid === account.id)?.farmingWeight ?? 0,
		}));

	profileIds.unshift({
		id: selectedProfile.profileId,
		name: selectedProfile.profileName,
		selected: selectedProfile.selected ?? false,
		gameMode: selectedProfile.gameMode as ProfileGameMode | undefined,
		weight: selectedProfile.members?.find((m) => m.uuid === account.id)?.farmingWeight ?? 0,
	});

	const memberData = await getProfile(account.id, selectedProfile.profileId ?? '').then((res) => res.data);
	const memberRanks = await getPlayerLeaderboardRanks(account.id, selectedProfile.profileId ?? '').then(
		(res) => res.data
	);

	const [member, memberRanksResponse] = await Promise.all([memberData, memberRanks]);

	const collections = PlayerStats.parseCollections(member);

	const uuid = account.id;
	const ranks = memberRanksResponse?.ranks;
	const weightRank = ranks?.farmingweight?.rank ?? -1;

	const farmingXp = getLevelProgress(
		'farming',
		member?.skills?.farming ?? 0,
		(member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
	);

	const weightStr =
		(
			member?.farmingWeight?.totalWeight ?? selectedProfile?.members.find((m) => m.uuid === uuid)?.farmingWeight
		)?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 'Not Found!';

	const topCollections = collections?.toSorted((a, b) => b.weight - a.weight).slice(0, 3);

	const description =
		`🌾 Farming Weight - ${weightStr}` +
		`${weightRank > 0 ? ` (#${weightRank})` : ''}\n` +
		`📜 Farming Level - ${farmingXp.level}` +
		`${(ranks?.farming?.rank ?? -1) > 0 ? ` (#${ranks?.farming?.rank?.toLocaleString()})` : ''}\n` +
		`⠀⤷ ${(member?.skills?.farming ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Total XP\n` +
		`\n⭐ Skyblock Level - ${(member?.skyblockXp ?? 0) / 100}` +
		`${(ranks?.skyblockxp?.rank ?? -1) > 0 ? ` (#${ranks?.skyblockxp?.rank?.toLocaleString()})` : ''}\n\n` +
		(topCollections
			.map((c) => {
				const crop = getCropFromName(c.key) ?? Crop.Wheat;
				const rank = ranks?.[c.key]?.rank ?? -1;

				return (
					`${CROP_UNICODE_EMOJIS[crop]} ${getCropDisplayName(crop)} - ${c.value.toLocaleString()}` +
					`${rank > 0 ? ` (#${rank.toLocaleString()})` : ''}`
				);
			})
			.join('\n') ?? '');

	return {
		account,
		description,
		collections,
		ranks,
		profile: selectedProfile,
	};
};
