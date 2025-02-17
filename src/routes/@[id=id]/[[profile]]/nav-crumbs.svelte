<script lang="ts" module>
	import FileChartColumn from 'lucide-svelte/icons/file-chart-column';
	import ChartColumn from 'lucide-svelte/icons/chart-column';
	import Sprout from 'lucide-svelte/icons/sprout';
	import ChartArea from 'lucide-svelte/icons/chart-area';
	import Ticket from 'lucide-svelte/icons/ticket';
</script>

<script lang="ts">
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import { getSidebarNav } from '$lib/hooks/sidebar-nav.svelte';
	import type { components } from '$lib/api/api';
	import Gamemode from '$comp/stats/player/gamemode.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { page } from '$app/state';
	import type { ProfileDetails, ProfileGameMode } from '$lib/api/elite';

	interface Props {
		account: components['schemas']['MinecraftAccountDto'];
		profile: components['schemas']['ProfileDetailsDto'];
		profiles: ProfileDetails[];
	}

	let { account, profile, profiles }: Props = $props();

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
			icon: ChartColumn,
			name: 'rates',
			href: `${path}/rates`,
		},
	]);

	const subPage = $derived(subPages.find((subPages) => subPages.name === lastPath) ?? subPages[0]);

	const crumbs = $derived<Crumb[]>([
		{
			name: account?.name,
			dropdown: otherMembers?.map((m) => ({
				name: m.username,
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
			name: account?.name,
			capitalize: false,
			href: `/@${account?.name}`,
			tooltip: 'Player',
			data: {
				uuid: account?.id,
			},
			dropdown: otherMembers?.map((m) => ({
				name: m.username,
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

	const breadcrumb = getBreadcrumb();
	const sidebarnav = getSidebarNav();

	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
		sidebarnav.setNav('Stats', sidebarCrumbs);
	});
</script>

{#snippet memberDropdown(crumb?: Crumb | Omit<Crumb, 'dropdown'>)}
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

{#snippet profileDropdown(crumb?: Crumb | Omit<Crumb, 'dropdown'>)}
	<div class="flex max-w-md flex-row items-center justify-between gap-2 py-1">
		<span>{crumb?.name}</span>
		{#if crumb?.data?.mode}
			<Gamemode class="size-4" gameMode={(crumb?.data?.mode ?? 'classic') as ProfileGameMode} popover={false} />
		{/if}
	</div>
{/snippet}
