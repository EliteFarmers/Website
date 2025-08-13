<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import ChannelSelect from '$comp/discord/channel-select.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import RoleSelect from '$comp/discord/role-select.svelte';
	import Head from '$comp/head.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let pings = $derived(data.pings ?? { enabled: false, delaySeconds: 0 });

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Servers',
			href: '/profile/servers',
		},
		{
			name: data.guild.name,
			href: `/guild/${data.guild.id}`,
		},
		{
			name: 'Pings',
		},
	]);

	const breadcrumb = getPageCtx();
	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
	});

	const favorites = getFavoritesContext();
	favorites.setPage({
		icon: data.guild.icon?.url ?? undefined,
		name: 'Contest Pings',
		href: page.url.pathname,
	});
</script>

<Head title="Contest Pings" description="Manage upcoming Jacob Contest pings for your guild" />

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="my-16 text-4xl">
			{data.guild?.name}
		</h1>
	</div>

	<section class="mb-16 flex w-full flex-col items-center justify-center gap-8">
		<div
			class="bg-card flex w-full max-w-4xl flex-col justify-center justify-items-center gap-4 rounded-md border p-4"
		>
			<h2 class="text-3xl">Upcoming Contest Ping Settings</h2>

			<form class="flex flex-col gap-2" method="post" action="?/enable" use:enhance>
				<div class="flex flex-col justify-center gap-1 sm:flex-row sm:gap-8">
					<div class="flex-1 space-y-2">
						<Label class="font-semibold">Channel to send pings in</Label>
						<ChannelSelect
							channels={data.guild.channels}
							value={pings.channelId ?? ''}
							triggerClass="w-full max-w-sm justify-between"
							placeholder="Select a channel"
							name="channel"
						/>
					</div>

					<div class="flex-1 space-y-2">
						<Label class="font-semibold">Ping Role (for every upcoming contest message)</Label>
						<RoleSelect
							roles={data.guild.roles}
							value={pings.alwaysPingRole ?? ''}
							triggerClass="w-full max-w-sm justify-between"
							placeholder="Select a role to ping"
							name="pingrole"
						/>
					</div>
				</div>
				<hr />
				<div class="mt-4 flex flex-col justify-center gap-1 sm:flex-row sm:gap-8">
					<div class="flex flex-1 flex-col gap-1">
						<div class="space-y-2">
							<Label>Cactus Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.cactus ?? ''}
								placeholder="Select a role for Cactus"
								name="cactus"
							/>
						</div>
						<div class="space-y-2">
							<Label>Carrot Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.carrot ?? ''}
								placeholder="Select a role for Carrot"
								name="carrot"
							/>
						</div>
						<div class="space-y-2">
							<Label>Potato Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.potato ?? ''}
								placeholder="Select a role for Potato"
								name="potato"
							/>
						</div>
						<div class="space-y-2">
							<Label>Wheat Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.wheat ?? ''}
								placeholder="Select a role for Wheat"
								name="wheat"
							/>
						</div>
						<div class="space-y-2">
							<Label>Melon Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.melon ?? ''}
								placeholder="Select a role for Melon"
								name="melon"
							/>
						</div>
					</div>
					<div class="flex flex-1 flex-col gap-1">
						<div class="space-y-2">
							<Label>Pumpkin Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.pumpkin ?? ''}
								placeholder="Select a role for Pumpkin"
								name="pumpkin"
							/>
						</div>
						<div class="space-y-2">
							<Label>Mushroom Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.mushroom ?? ''}
								placeholder="Select a role for Mushroom"
								name="mushroom"
							/>
						</div>
						<div class="space-y-2">
							<Label>Cocoa Beans Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.cocoaBeans ?? ''}
								placeholder="Select a role for Cocoa Beans"
								name="cocoa"
							/>
						</div>
						<div class="space-y-2">
							<Label>Sugar Cane Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.sugarCane ?? ''}
								placeholder="Select a role for Sugar Cane"
								name="cane"
							/>
						</div>
						<div class="space-y-2">
							<Label>Nether Wart Ping Role</Label>
							<RoleSelect
								roles={data.guild.roles}
								triggerClass="w-full max-w-sm justify-between"
								value={pings.cropPingRoles?.netherWart ?? ''}
								placeholder="Select a role for Nether Wart"
								name="wart"
							/>
						</div>
					</div>
				</div>
				<div class="mt-2 flex flex-col gap-4 sm:flex-row">
					<Button type="submit" color="red" formaction="?/disable" disabled={!pings.enabled}
						>Turn off Pings</Button
					>
					<Button type="submit">{!pings.enabled ? 'Enable and ' : ''}Update</Button>
				</div>
			</form>
		</div>
	</section>
</div>
