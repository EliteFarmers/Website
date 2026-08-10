<script lang="ts">
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import APIstatus from '$comp/stats/apistatus.svelte';
	import BadgeList from '$comp/stats/namecard/badge-list.svelte';
	import NameCard from '$comp/stats/namecard/name-card.svelte';
	import JoinElitePopup from '$comp/stats/player/join-elite-popup.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import type { FarmingInventoryDto, LeaderboardRanksResponse, ProfileMemberDto } from '$lib/api';
	import { initStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import { watch } from 'runed';
	import { tick, type Snippet } from 'svelte';
	import Time from 'svelte-time/Time.svelte';
	import type { LayoutData } from './$types';
	import NavCrumbs from './nav-crumbs.svelte';

	type ResolvedProfileData = Awaited<LayoutData['profileData']>;
	type ValidProfileData = Exclude<ResolvedProfileData, { code: number; error: string } | { noProfiles: true }>;

	let {
		data,
		ssrMemberData,
		ssrRanksData,
		ssrFarmingInventoryData,
		children,
	}: {
		data: ValidProfileData;
		ssrMemberData?: ProfileMemberDto | undefined;
		ssrRanksData?: LeaderboardRanksResponse | undefined;
		ssrFarmingInventoryData?: FarmingInventoryDto | undefined;
		children: Snippet;
	} = $props();

	const ctx = initStatsContext(
		(() => ({
			account: data.account,
			selectedProfile: data.profile,
			profiles: data.profiles,
			style: data.style,
			nameCardFrame: data.nameCardFrame,
			initialMember: ssrMemberData ?? undefined,
			initialRanks: ssrRanksData ?? undefined,
			initialFarmingInventory: ssrFarmingInventoryData ?? undefined,
			bot: page.data.bot ?? false,
		}))()
	);

	let path = $derived(`/@${data.account?.name}/${data.profile?.profileName}`);

	watch.pre(
		() => data,
		(data) => {
			initStatsContext({
				account: data.account,
				selectedProfile: data.profile,
				profiles: data.profiles,
				style: data.style,
				nameCardFrame: data.nameCardFrame,
				initialMember: ssrMemberData ?? undefined,
				initialRanks: ssrRanksData ?? undefined,
				initialFarmingInventory: ssrFarmingInventoryData ?? undefined,
				bot: page.data.bot ?? false,
			});

			if (!browser) return;

			const current = `${page.params.id}${page.params.profile ? `/${page.params.profile}` : ''}`;
			const wanted = `${data.account?.name}/${data.profile?.profileName}`;

			if (current !== wanted) {
				tick().then(() =>
					replaceState(
						// @ts-expect-error The runtime route id and params are correlated, but that relation is lost from page state.
						resolve(page.route.id, {
							...page.params,
							id: data.account?.name ?? '',
							profile: data.profile?.profileName,
						}),
						page.state
					)
				);
			}
		}
	);

	const route = $derived(page.route.id?.split('/').at(-1));
	const pageTheme = $derived(data.pageStyle?.page);
	const pageBackground = $derived(pageTheme?.background);
	const pageBackgroundImage = $derived(
		pageBackground?.imageUrl ? data.pageStyle?.imageRefs?.[pageBackground.imageUrl] : undefined
	);
	const pageThemeCss = $derived(
		Object.entries(pageTheme?.properties ?? {})
			.filter(([property]) => /^--[a-zA-Z0-9_-]+$|^[a-zA-Z][a-zA-Z0-9-]*$/.test(property))
			.map(([property, value]) => `${property}:${value}`)
			.join(';')
	);
</script>

<div class="relative isolate w-full overflow-clip [contain:paint]">
	{#if pageBackground?.imageUrl}
		<img
			src={pageBackgroundImage?.posterUrl ?? pageBackgroundImage?.url ?? pageBackground.imageUrl}
			srcset={pageBackgroundImage
				? Object.values(pageBackgroundImage.posterSources ?? pageBackgroundImage.sources)
						.map((source) => `${source.url} ${source.width}w`)
						.join(', ')
				: undefined}
			sizes="100vw"
			alt=""
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 -z-10 h-full w-full"
			style="object-fit: {pageBackground.fit}; object-position: {pageBackground.position}; opacity: {pageBackground.opacity};"
		/>
	{/if}
	<div class="profile-theme relative z-0 m-0 w-full p-0" style={pageThemeCss}>
		<NavCrumbs account={data.account} profile={data.profile} profiles={data.profiles} />
		<JoinElitePopup />
		<NameCard />
		<BadgeList />

		{@render pagenav()}

		<APIstatus />

		{@render children?.()}

		{@render pagenav()}

		<div class="my-16 flex flex-col items-center justify-center leading-none">
			<div class="flex flex-col justify-start gap-4 sm:items-center sm:justify-center">
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="text-muted-foreground select-none">Player UUID</span>
					<div class="flex flex-row items-center gap-1">
						<span class="select-all">{data.account.id}</span>
						<CopyToClipboard text={data.account.id} class="-my-2 size-8" />
					</div>
				</div>
				<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<span class="text-muted-foreground select-none">Profile UUID</span>
					<div class="flex flex-row items-center gap-1">
						<span class="select-all">{data.profile?.profileId}</span>
						<CopyToClipboard text={data.profile?.profileId} class="-my-2 size-8" />
					</div>
				</div>
				{#if data.account?.discordId}
					<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
						<span class="text-muted-foreground select-none">Linked Discord ID</span>
						<div class="flex flex-row items-center gap-1">
							<span class="select-all">{data.account?.discordId}</span>
							<CopyToClipboard text={data.account?.discordId} class="-my-2 size-8" />
						</div>
					</div>
				{/if}
				{#if ctx.member.current}
					<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
						<span class="text-muted-foreground select-none">Profile Last Fetched</span>
						<DateDisplay
							timestamp={Number(ctx.member.current?.lastUpdated ?? 0) * 1000}
							format="MMMM D, YYYY h:mm A"
						>
							<div class="text-muted-foreground flex flex-1 flex-col items-center gap-0.5 text-sm">
								<span class="select-none">Profile Last Changed</span>
								<Time
									timestamp={Number(ctx.member.current?.lastDataChanged ?? 0) * 1000}
									format="dddd, MMMM D, YYYY h:mm A"
								/>
							</div>
						</DateDisplay>
					</div>

					{#if page.url.pathname.includes('/garden')}
						<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
							<span class="text-muted-foreground select-none">Garden Last Updated</span>
							<DateDisplay
								timestamp={Number(ctx.member.current?.garden?.lastSave ?? 0) * 1000}
								format="MMMM D, YYYY h:mm A"
							/>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>

{#snippet pagenav()}
	<div class="flex flex-row justify-center">
		<div class="my-6 flex max-w-fit flex-wrap justify-center rounded-md border border-solid p-1 sm:flex-row">
			<Button
				variant="ghost"
				size="sm"
				href="{path}/contests"
				class="{route === 'contests' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Contests</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/charts"
				class="{route === 'charts' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Charts</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href={path}
				class="{route === '[[profile]]' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Stats</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/garden"
				class="{route === 'garden' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Garden</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/fortune"
				class="{route === 'fortune' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Fortune</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/pest-farming"
				class="{route === 'pest-farming' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Pest Farming</Button
			>
			<Button
				variant="ghost"
				size="sm"
				href="{path}/ranks"
				class="{route === 'ranks' ? 'bg-muted' : ''} w-1/3 cursor-pointer sm:w-auto">Ranks</Button
			>
			{#if page.data.session?.perms.support}
				<Button variant="ghost" size="sm" href="/admin{path}" class="w-1/3 cursor-pointer sm:w-auto"
					>Admin</Button
				>
			{/if}
		</div>
	</div>
{/snippet}
