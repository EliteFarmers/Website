<script lang="ts">
	import Head from '$comp/head.svelte';
	import { ChannelType } from '$lib/utils';
	import { Button, Label, Select } from 'flowbite-svelte';
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
			name: '#' + (c.name ?? ''),
		}))
		.filter((c) => c.value);

	$: roles = (data.guildData?.roles ?? [])
		.sort((a, b) => (b.position ?? 0) - (a.position ?? 0))
		.map((r) => ({
			value: r.id ?? '',
			name: r.name ?? '',
		}))
		.filter((r) => r.value && r.name !== '@everyone');
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
			class="flex flex-col justify-center justify-items-center gap-4 w-[90%] md:w-[70%] max-w-screen-lg bg-gray-100 dark:bg-zinc-800 rounded-md p-4"
		>
			<h2 class="text-3xl">Upcoming Contest Ping Settings</h2>

			<form class="flex flex-col gap-2" method="post" action="?/enable" use:enhance>
				<Label>
					<span>Channel to send pings in</span>
					<Select
						items={channels}
						value={pings.channelId ?? ''}
						placeholder="Select a channel"
						name="channel"
					/>
				</Label>

				<Label>
					<span>Ping Role (for every upcoming contest message)</span>
					<Select
						items={roles}
						value={pings.alwaysPingRole ?? ''}
						placeholder="Select a role"
						name="pingrole"
					/>
				</Label>
				<div class="flex flex-col sm:flex-row gap-1 sm:gap-8 justify-center">
					<div class="flex-1 flex flex-col gap-1">
						<Label>
							<span>Cactus Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.cactus ?? ''}
								placeholder="Select a role for Cactus"
								name="cactus"
							/>
						</Label>
						<Label>
							<span>Carrot Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.carrot ?? ''}
								placeholder="Select a role for Carrot"
								name="carrot"
							/>
						</Label>
						<Label>
							<span>Potato Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.cocoaBeans ?? ''}
								placeholder="Select a role for Potato"
								name="potato"
							/>
						</Label>
						<Label>
							<span>Wheat Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.sugarCane ?? ''}
								placeholder="Select a role for Wheat"
								name="wheat"
							/>
						</Label>
						<Label>
							<span>Melon Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.melon ?? ''}
								placeholder="Select a role for Melon"
								name="melon"
							/>
						</Label>
					</div>
					<div class="flex-1 flex flex-col gap-1">
						<Label>
							<span>Pumpkin Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.pumpkin ?? ''}
								placeholder="Select a role for Pumpkin"
								name="pumpkin"
							/>
						</Label>
						<Label>
							<span>Mushroom Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.mushroom ?? ''}
								placeholder="Select a role for Mushroom"
								name="mushroom"
							/>
						</Label>
						<Label>
							<span>Cocoa Beans Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.cocoaBeans ?? ''}
								placeholder="Select a role for Cocoa Beans"
								name="cocoa"
							/>
						</Label>
						<Label>
							<span>Sugar Cane Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.sugarCane ?? ''}
								placeholder="Select a role for Sugar Cane"
								name="cane"
							/>
						</Label>
						<Label>
							<span>Nether Wart Ping Role</span>
							<Select
								items={roles}
								value={pings.cropPingRoles?.netherWart ?? ''}
								placeholder="Select a role for Nether Wart"
								name="wart"
							/>
						</Label>
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
