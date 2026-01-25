<script lang="ts" module>
	import ChartArea from '@lucide/svelte/icons/chart-area';
	import Clover from '@lucide/svelte/icons/clover';
	import FileChartColumn from '@lucide/svelte/icons/file-chart-column';
	import Sprout from '@lucide/svelte/icons/sprout';
	import Ticket from '@lucide/svelte/icons/ticket';
	import Trophy from '@lucide/svelte/icons/trophy';
</script>

<script lang="ts">
	import { page } from '$app/state';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import Gamemode from '$comp/stats/player/gamemode.svelte';
	import type { MinecraftAccountDto, ProfileDetailsDto } from '$lib/api';
	import type { ProfileDetails, ProfileGameMode } from '$lib/api/elite';
	import { formatIgn } from '$lib/format';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { tick } from 'svelte';

	interface Props {
		account: MinecraftAccountDto;
		profile: ProfileDetailsDto;
		profiles: ProfileDetails[];
	}

	let { account, profile, profiles }: Props = $props();

	const thisMember = $derived(profile.members?.find((m) => m.uuid === account?.id) ?? null);
	const otherMembers = $derived(profile.members?.filter((m) => m.uuid !== account?.id && m.active) ?? []);
	const otherProfiles = $derived(profiles?.filter((p) => p.id !== profile?.profileId) ?? []);

	let path = $derived(`/@${account?.name}/${profile?.profileName}`);

	const lastPath = $derived(page.url.pathname.split('/').at(-1));
	const subPages = $derived<Crumb[]>([
		{
			icon: FileChartColumn,
			name: 'stats',
			href: path,
		},
		{
			icon: Ticket,
			name: 'contests',
			href: `${path}/contests`,
		},
		{
			icon: ChartArea,
			name: 'charts',
			href: `${path}/charts`,
		},
		{
			icon: Sprout,
			name: 'garden',
			href: `${path}/garden`,
		},
		{
			icon: Clover,
			name: 'fortune',
			href: `${path}/fortune`,
		},
		{
			icon: Trophy,
			name: 'ranks',
			href: `${path}/ranks`,
		},
	]);

	const subPage = $derived(subPages.find((subPages) => subPages.name === lastPath) ?? subPages[0]);

	const crumbs = $derived<Crumb[]>([
		{
			name: formatIgn(thisMember?.username, thisMember?.meta) || account?.name,
			dropdown: otherMembers?.map((m) => ({
				name: formatIgn(m.username, m.meta),
				href: `/@${m.uuid}/${profile?.profileId}`,
				data: {
					uuid: m.uuid,
					weight: m.farmingWeight?.toString(),
				},
				snippet: memberDropdown,
			})),
			data: {
				uuid: account?.id,
			},
			snippet: memberDropdown,
		},
		{
			name: profile?.profileName,
			dropdown: otherProfiles?.map((p) => ({
				name: p.name ?? 'Unknown',
				href: `/@${account?.name}/${p.name}`,
				data: {
					mode: p.gameMode,
					popover: false,
					class: 'size-4',
					map: true,
				},
				snippet: profileDropdown,
			})),
			data: {
				mode: profile.gameMode,
			},
			snippet: profileDropdown,
		},
		{
			...subPage,
			icon: undefined,
			dropdown: subPages
				.filter((p) => p.name !== subPage.name)
				.map((p) => ({
					name: p.name,
					href: p.href,
				})),
		},
	]);

	const sidebarCrumbs = $derived<Crumb[]>([
		{
			icon: PlayerHead,
			name: formatIgn(thisMember?.username, thisMember?.meta) || account?.name,
			capitalize: false,
			href: `/@${account?.name}`,
			tooltip: 'Player',
			data: {
				uuid: account?.id,
			},
			dropdown: otherMembers?.map((m) => ({
				name: formatIgn(m.username, m.meta),
				capitalize: false,
				href: `/@${m.uuid}/${profile?.profileId}`,
				data: {
					uuid: m.uuid,
				},
				icon: PlayerHead,
			})),
		},
		{
			icon: Gamemode,
			name: profile?.profileName,
			href: path,
			tooltip: 'Profile',
			data: {
				gameMode: profile.gameMode,
				popover: false,
				class: 'size-4',
				map: true,
			},
			dropdown: otherProfiles?.map((p) => ({
				name: p.name ?? 'Unknown',
				href: `/@${account?.name}/${p.name}`,
				data: {
					gameMode: p.gameMode,
					popover: false,
					class: 'size-4',
					map: true,
				},
				icon: Gamemode,
			})),
		},
		{
			...subPage,
			dropdown: subPages.filter((p) => p.name !== subPage.name),
		},
	]);

	const pageCtx = getPageCtx();
	const favorites = getFavoritesContext();

	$effect.pre(() => {
		pageCtx.setBreadcrumbs(crumbs);
		pageCtx.setSidebar('Stats', sidebarCrumbs);
		tick().then(() => {
			favorites.setPage({
				icon: account?.id ? `https://api.elitebot.dev/account/${account.id}/face.png` : undefined,
				name: document.title,
				href: page.url.pathname,
			});
		});
	});
</script>

{#snippet memberDropdown(crumb: Crumb | Omit<Crumb, 'dropdown'>)}
	<div class="flex max-w-md flex-row items-center justify-between gap-2 py-1">
		<div class="flex w-full flex-1 flex-row items-center gap-2">
			<PlayerHead uuid={crumb?.data?.uuid?.toString() ?? ''} size="md" />
			<span>{crumb?.name}</span>
		</div>
		{#if crumb?.data?.weight}
			<span>{(+crumb?.data?.weight).toLocaleString()}</span>
		{/if}
	</div>
{/snippet}

{#snippet profileDropdown(crumb: Crumb | Omit<Crumb, 'dropdown'>)}
	<div class="flex max-w-md flex-row items-center justify-between gap-2 py-1">
		<span>{crumb?.name}</span>
		{#if crumb?.data?.mode}
			<Gamemode class="size-4" gameMode={(crumb?.data?.mode ?? 'classic') as ProfileGameMode} popover={false} />
		{/if}
	</div>
{/snippet}
