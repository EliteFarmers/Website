<script lang="ts">
	import Head from '$comp/head.svelte';
	import { ChannelType } from '$lib/utils';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import GuildIcon from '$comp/discord/guild-icon.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let pings = $derived(data.pings ?? {});

	let channels = $derived(
		(data.guild?.channels ?? [])
			// Only allow text channels
			.filter((c) => c.id && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
			.map((c) => ({
				value: c.id ?? '',
				label: '#' + (c.name ?? ''),
			}))
			.filter((c) => c.value)
	);

	let roles = $derived(
		(data.guild?.roles ?? [])
			.map((r) => ({
				value: r.id ?? '',
				label: '@' + (r.name ?? ''),
			}))
			.filter((r) => r.value && r.label !== '@@everyone')
	);
</script>

<Head title="Contest Pings" description="Manage upcoming Jacob Contest pings for your guild" />

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="my-16 text-4xl">
			{data.guild?.name}
		</h1>
	</div>

	{#if !form?.success && form?.message}
		<h5 class="text-xl font-semibold text-red-700">
			<p>{form?.message}</p>
		</h5>
	{/if}

	<section class="mb-16 flex w-full flex-col items-center justify-center gap-8">
		<div
			class="flex w-[90%] max-w-screen-lg flex-col justify-center justify-items-center gap-4 rounded-md bg-primary-foreground p-4 md:w-[70%]"
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
				<div class="flex flex-col justify-center gap-1 sm:flex-row sm:gap-8">
					<div class="flex flex-1 flex-col gap-1">
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
								value={pings.cropPingRoles?.potato ?? ''}
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
					<div class="flex flex-1 flex-col gap-1">
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
					<Button type="submit" color="red" formaction="?/disable" disabled={!pings.enabled}
						>Turn off Pings</Button
					>
					<Button type="submit">{!pings.enabled ? 'Enable and ' : ''}Update</Button>
				</div>
			</form>
		</div>
	</section>
</div>
