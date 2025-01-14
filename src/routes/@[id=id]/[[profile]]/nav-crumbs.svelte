<script lang="ts" module>
	import FileChartColumn from 'lucide-svelte/icons/file-chart-column';
	import ChartColumn from 'lucide-svelte/icons/chart-column';
	import Flower from 'lucide-svelte/icons/flower';
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
	import type { ProfileGameMode } from '$lib/api/elite';

	interface Props {
		account: components['schemas']['MinecraftAccountDto'];
		profile: components['schemas']['ProfileDetailsDto'];
	}

	let { account, profile }: Props = $props();

	const otherMembers = $derived(profile.members?.filter((m) => m.uuid !== account?.id && m.active) ?? []);

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
			icon: Flower,
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
			dropdown: otherMembers.map((p) => ({
				name: p.username,
				href: `/@${account?.name}/${p.username}`,
				data: {
					mode: profile.gameMode,
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
			href: `/@${account?.name}`,
			data: {
				uuid: account?.id,
			},
			dropdown: otherMembers?.map((m) => ({
				name: m.username,
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
			data: {
				gameMode: profile.gameMode,
				popover: false,
				class: 'size-4',
				map: true,
			},
			dropdown: otherMembers.map((p) => ({
				name: p.username,
				href: `/@${account?.name}/${p.username}`,
				data: {
					gameMode: profile.gameMode,
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
	<div class="flex max-w-md flex-row items-center justify-between gap-2">
		<div class="flex w-full flex-1 flex-row items-center gap-2">
			<img
				src="https://mc-heads.net/avatar/{crumb?.data?.uuid ?? ''}"
				alt="Player Head"
				class="aspect-square size-6 rounded-sm"
			/>
			<span class="font-semibold">{crumb?.name}</span>
		</div>
		{#if crumb?.data?.weight}
			<span>{(+crumb?.data?.weight).toLocaleString()}</span>
		{/if}
	</div>
{/snippet}

{#snippet profileDropdown(crumb?: Crumb | Omit<Crumb, 'dropdown'>)}
	<div class="flex max-w-md flex-row items-center justify-between gap-2">
		<span class="font-semibold">{crumb?.name}</span>
		{#if crumb?.data?.mode}
			<Gamemode
				class="max-size-fit"
				gameMode={(crumb?.data?.mode ?? 'classic') as ProfileGameMode}
				popover={false}
			/>
		{/if}
	</div>
{/snippet}
