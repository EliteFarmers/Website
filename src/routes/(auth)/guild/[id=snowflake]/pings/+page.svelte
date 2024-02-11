<script lang="ts">
	import Head from '$comp/head.svelte';
	import { ChannelType } from '$lib/utils';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';

	export let data: PageData;
	export let form: ActionData;

	$: pings = data.pings ?? {};

	$: channels = (data.guildData?.channels ?? [])
		// Only allow text channels
		.filter((c) => c.id && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
		.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
		.map((c) => ({
			value: c.id ?? '',
			label: '#' + (c.name ?? ''),
		}))
		.filter((c) => c.value);

	$: roles = (data.guildData?.roles ?? [])
		.sort((a, b) => (b.position ?? 0) - (a.position ?? 0))
		.map((r) => ({
			value: r.id ?? '',
			label: r.name ?? '',
		}))
		.filter((r) => r.value && r.label !== '@everyone');
</script>

<Head title="Contest Pings" description="Manage upcoming Jacob Contest pings for your guild" />

<main class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<Guildicon guild={data.guild} size={16} />
		<h1 class="text-4xl my-16">
			{data.guild?.name}
		</h1>
	</div>

	{#if !form?.success && form?.message}
		<h5 class="text-xl font-semibold text-red-700">
			<p>{form?.message}</p>
		</h5>
	{/if}

	<section class="flex flex-col gap-8 w-full justify-center items-center mb-16">
		<div
			class="flex flex-col justify-center justify-items-center gap-4 w-[90%] md:w-[70%] max-w-screen-lg bg-primary-foreground rounded-md p-4"
		>
			<h2 class="text-3xl">Upcoming Contest Ping Settings</h2>

			<form class="flex flex-col gap-2" method="post" action="?/enable" use:enhance>
				<div class="space-y-2">
					<Label>Channel to send pings in</Label>
					<Select.Simple
						options={channels}
						value={pings.channelId ?? ''}
						placeholder="Select a channel"
						name="channel"
					/>
				</div>

				<div class="space-y-2">
					<Label>Ping Role (for every upcoming contest message)</Label>
					<Select.Simple
						options={roles}
						value={pings.alwaysPingRole ?? ''}
						placeholder="Select a role"
						name="pingrole"
					/>
				</div>
				<div class="flex flex-col sm:flex-row gap-1 sm:gap-8 justify-center">
					<div class="flex-1 flex flex-col gap-1">
						<div class="space-y-2">
							<Label>Cactus Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.cactus ?? ''}
								placeholder="Select a role for Cactus"
								name="cactus"
							/>
						</div>
						<div class="space-y-2">
							<Label>Carrot Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.carrot ?? ''}
								placeholder="Select a role for Carrot"
								name="carrot"
							/>
						</div>
						<div class="space-y-2">
							<Label>Potato Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.cocoaBeans ?? ''}
								placeholder="Select a role for Potato"
								name="potato"
							/>
						</div>
						<div class="space-y-2">
							<Label>Wheat Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.wheat ?? ''}
								placeholder="Select a role for Wheat"
								name="wheat"
							/>
						</div>
						<div class="space-y-2">
							<Label>Melon Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.melon ?? ''}
								placeholder="Select a role for Melon"
								name="melon"
							/>
						</div>
					</div>
					<div class="flex-1 flex flex-col gap-1">
						<div class="space-y-2">
							<Label>Pumpkin Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.pumpkin ?? ''}
								placeholder="Select a role for Pumpkin"
								name="pumpkin"
							/>
						</div>
						<div class="space-y-2">
							<Label>Mushroom Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.mushroom ?? ''}
								placeholder="Select a role for Mushroom"
								name="mushroom"
							/>
						</div>
						<div class="space-y-2">
							<Label>Cocoa Beans Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.cocoaBeans ?? ''}
								placeholder="Select a role for Cocoa Beans"
								name="cocoa"
							/>
						</div>
						<div class="space-y-2">
							<Label>Sugar Cane Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.sugarCane ?? ''}
								placeholder="Select a role for Sugar Cane"
								name="cane"
							/>
						</div>
						<div class="space-y-2">
							<Label>Nether Wart Ping Role</Label>
							<Select.Simple
								options={roles}
								value={pings.cropPingRoles?.netherWart ?? ''}
								placeholder="Select a role for Nether Wart"
								name="wart"
							/>
						</div>
					</div>
				</div>
				<div class="mt-2 flex flex-row gap-4">
					<form method="post" action="?/disable" use:enhance>
						<Button type="submit" color="red" disabled={!pings.enabled}>Turn off Pings</Button>
					</form>
					<Button type="submit">{!pings.enabled ? 'Enable and ' : ''}Update</Button>
				</div>
			</form>
		</div>
	</section>
</main>
