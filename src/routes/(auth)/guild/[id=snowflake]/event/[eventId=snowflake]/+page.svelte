<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { Input } from '$ui/input';
	import { Textarea } from '$ui/textarea';
	import * as Popover from '$ui/popover';
	import * as Dialog from '$ui/dialog';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import Settings from 'lucide-svelte/icons/settings';
	import Image from 'lucide-svelte/icons/image';
	import Head from '$comp/head.svelte';
	import Member from './member.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import { EventType } from '$lib/utils';
	import type { PageData, ActionData } from './$types';
	import { NumberInput } from '$comp/ui/number-input';
	import type { components } from '$lib/api/api';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { CROP_TO_ELITE_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	export let data: PageData;
	export let form: ActionData;

	let clickOutsideModalEdit = false;
	let clickOutsideModalEditImage = false;
	let pending = false;

	let banMemberModal = false;

	let banMemberName = '';
	let banMemberUuid = '';

	let memberLimit = 10;
	let bansLimit = 10;

	function sort(a: { score?: string | null } | undefined, b: { score?: string | null } | undefined) {
		return +(b?.score ?? 0) - +(a?.score ?? 0);
	}

	$: event = data.event;

	$: medalWeights = ((event?.data as components['schemas']['MedalEventData'])?.medalWeights ?? undefined) as
		| Record<string, number>
		| undefined;
	$: cropWeights = ((event?.data as components['schemas']['WeightEventData'])?.cropWeights ?? undefined) as
		| Record<string, number>
		| undefined;
</script>

<Head title="Events" description="Manage Events happening in your guild" />

<main class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="text-4xl my-16">
			{event?.name}
		</h1>
	</div>

	{#if form?.error}
		<h5 class="text-xl font-semibold text-red-700">
			<p>{form?.error}</p>
		</h5>
	{/if}

	<section class="flex flex-col gap-8 justify-center items-center justify-items-center max-w-4xl w-full">
		<div
			class="flex p-4 flex-col justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg bg-primary-foreground rounded-md"
		>
			<div class="flex flex-row justify-between p-4 gap-2">
				<div class="flex flex-col gap-2">
					<div class="flex flex-row items-center gap-2">
						{#if !event.approved}
							<Popover.Mobile>
								<div slot="trigger">
									<TriangleAlert class="text-red-500 mt-1.5" />
								</div>
								<div>
									<p class="font-semibold">Pending approval!</p>
									<p>Ask kaeso.dev to approve this event.</p>
								</div>
							</Popover.Mobile>
						{/if}
						<h2 class="text-3xl">{event.name}</h2>
					</div>

					<p class="text-lg">{event.description}</p>
					<p class="text-lg">{event.rules}</p>
					<p class="text-lg">{event.prizeInfo}</p>
					<div class="flex flex-col md:flex-row gap-2 font-semibold md:items-center justify-start text-lg">
						<div>
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleTimeString()}</span>
						</div>
						<span class="hidden md:block"> - </span>
						<div>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleTimeString()}</span>
						</div>
					</div>
				</div>
				<div class="p-4 flex flex-col gap-2">
					<Popover.Mobile>
						<div slot="trigger">
							<Button
								on:click={() => {
									clickOutsideModalEdit = true;
								}}
							>
								<Settings />
							</Button>
						</div>
						<div>
							<p>Edit Event</p>
						</div>
					</Popover.Mobile>

					<Popover.Mobile>
						<div slot="trigger">
							<Button
								on:click={() => {
									clickOutsideModalEditImage = true;
								}}
							>
								<Image />
							</Button>
						</div>
						<div>
							<p>Edit Banner Image</p>
						</div>
					</Popover.Mobile>

					{#if event.approved}
						<Popover.Mobile>
							<div slot="trigger">
								<Button href="/event/{event.id}" target="_blank">
									<ExternalLink />
								</Button>
							</div>
							<div>
								<p>View Event Page</p>
							</div>
						</Popover.Mobile>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<div class="flex flex-row items-center justify-center max-w-md">
		<Button href="/guild/{data.guild.id}/events" variant="secondary">Back to Events</Button>
	</div>

	<div class="flex flex-col md:flex-row gap-8 items-start justify-center max-w-6xl w-full px-4">
		<section class="flex flex-1 flex-col gap-4 p-4 rounded-md bg-primary-foreground w-full">
			<h3 class="text-xl">Event Members</h3>
			<div class="flex flex-col flex-1 w-full justify-center items-center gap-2">
				{#await data.members}
					<p>Loading...</p>
				{:then members}
					{@const m = (members ?? []).sort(sort)}
					{#each m.slice(0, memberLimit) as member (member.playerUuid + '' + member.id)}
						<Member {member}>
							<Popover.Mobile>
								<div slot="trigger">
									<Button
										size="sm"
										on:click={() => {
											banMemberName = member.playerName ?? '';
											banMemberUuid = member.playerUuid ?? '';
											banMemberModal = true;
										}}
									>
										<Trash2 size={16} class="text-destructive" />
									</Button>
								</div>
								<div>
									<p>Ban this user from the event</p>
								</div>
							</Popover.Mobile>
						</Member>
					{/each}
					{#if m.length > memberLimit}
						<Button
							variant="secondary"
							on:click={() => {
								memberLimit += m.length;
							}}
						>
							Show All
						</Button>
					{:else if memberLimit > 10}
						<Button
							variant="secondary"
							on:click={() => {
								memberLimit = 10;
							}}
						>
							Show Less
						</Button>
					{/if}
					{#if m.length === 0}
						<p>No members have joined this event yet.</p>
					{/if}
				{:catch error}
					<p>{error.message}</p>
				{/await}
			</div>
		</section>
		<section class="flex flex-1 flex-col gap-4 p-4 rounded-md bg-primary-foreground">
			<h3 class="text-xl">Removed Event Members</h3>
			<div class="flex flex-col w-full justify-center items-center gap-2 justify-items-center">
				{#await data.bans}
					<p>Loading...</p>
				{:then bans}
					{@const b = (bans ?? []).sort(sort)}
					{#each b.slice(0, bansLimit) as member (member.playerUuid)}
						<Member {member}>
							<form method="POST" action="?/unbanmember" use:enhance>
								<input type="hidden" name="id" value={event.id} />
								<input type="hidden" name="uuid" value={member.playerUuid} />
								<Popover.Mobile>
									<div slot="trigger">
										<Button type="submit" color="green" class="unban" size="sm">
											<ArrowUp size={16} />
										</Button>
									</div>
									<div>
										<p>Unban this user from the event</p>
									</div>
								</Popover.Mobile>
							</form>
						</Member>
					{/each}
					{#if b.length > bansLimit}
						<Button
							variant="secondary"
							on:click={() => {
								bansLimit += b.length;
							}}
						>
							Show All
						</Button>
					{:else if bansLimit > 10}
						<Button
							variant="secondary"
							on:click={() => {
								bansLimit = 10;
							}}
						>
							Show Less
						</Button>
					{/if}
					{#if b.length === 0}
						<p>No members have been removed from this event yet.</p>
					{/if}
				{:catch error}
					<p>{error.message}</p>
				{/await}
			</div>
		</section>
	</div>
	<div class="flex flex-col p-4 rounded-md bg-primary-foreground">
		{#await data.defaults}
			<p>Loading...</p>
		{:then defaults}
			{#if event.type === +EventType.FarmingWeight && cropWeights}
				<form
					action="?/editCropWeights"
					method="post"
					class="flex flex-col gap-2 items-center"
					use:enhance={() => {
						pending = true;
						return async ({ result, update }) => {
							if (result) {
								pending = false;
								update();
							}
						};
					}}
				>
					<input type="hidden" name="id" bind:value={data.event.id} />
					<h4 class="text-lg mb-4">Crop Weight Values</h4>

					<div class="flex flex-col md:flex-row md:flex-wrap gap-1 max-w-4xl justify-center items-center">
						{#each Object.entries(defaults?.cropWeights ?? {}) as [crop] (crop)}
							{@const c = getCropFromName(crop) ?? Crop.Wheat}
							{@const cropName = getCropDisplayName(c)}
							{@const name = CROP_TO_ELITE_CROP[c]}

							<div class="flex flex-row items-center gap-1 md:basis-96 px-4">
								<img src={PROPER_CROP_TO_IMG[cropName]} alt={crop} class="w-8 h-8 pixelated" />
								<Label class="flex-1">{cropName}</Label>
								<NumberInput
									min={0}
									max={1_000_000}
									{name}
									value={cropWeights[name]}
									maxlength={64}
									class="flex-1"
									required
								/>
							</div>
						{/each}
					</div>
					<p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
						Default values are balanced, Pumpkin and Melon RNG drops don't get counted in events.
					</p>

					<div class="flex flex-row gap-2">
						<Button
							variant="destructive"
							disabled={pending}
							on:click={() => {
								cropWeights = structuredClone(defaults?.cropWeights ?? {});
							}}>Reset Values</Button
						>
						<Button type="submit" disabled={pending}>Update</Button>
					</div>
				</form>
			{:else if event.type === +EventType.Medals && medalWeights}
				<form
					action="?/editMedalWeights"
					method="post"
					class="flex flex-col gap-2 items-center"
					use:enhance={() => {
						pending = true;
						return async ({ result, update }) => {
							if (result) {
								pending = false;
								update();
							}
						};
					}}
				>
					<input type="hidden" name="id" bind:value={data.event.id} />
					<h4 class="text-lg mb-4">Medal Point Values</h4>

					<div class="flex flex-col gap-1 max-w-4xl justify-center items-center">
						<div class="flex flex-row items-center gap-1 px-4 w-full">
							<img src="/images/medals/bronze.webp" alt="Bronze" class="w-8 h-8 pixelated" />
							<Label class="flex-1">Bronze</Label>
							<NumberInput
								min={0}
								max={1_000}
								name="bronze"
								value={medalWeights['Bronze']}
								maxlength={64}
								class="flex-1"
								required
							/>
						</div>
						<div class="flex flex-row items-center gap-1 px-4 w-full">
							<img src="/images/medals/silver.webp" alt="Silver" class="w-8 h-8 pixelated" />
							<Label class="flex-1">Silver</Label>
							<NumberInput
								min={0}
								max={1_000}
								name="silver"
								value={medalWeights['Silver']}
								maxlength={64}
								class="flex-1"
								required
							/>
						</div>
						<div class="flex flex-row items-center gap-1 px-4 w-full">
							<img src="/images/medals/gold.webp" alt="Gold" class="w-8 h-8 pixelated" />
							<Label class="flex-1">Gold</Label>
							<NumberInput
								min={0}
								max={1_000}
								name="gold"
								value={medalWeights['Gold']}
								maxlength={64}
								class="flex-1"
								required
							/>
						</div>
						<div class="flex flex-row items-center gap-1 px-4 w-full">
							<img src="/images/medals/platinum.webp" alt="Platinum" class="w-8 h-8 pixelated" />
							<Label class="flex-1">Platinum</Label>
							<NumberInput
								min={0}
								max={1_000}
								name="platinum"
								value={medalWeights['Platinum']}
								maxlength={64}
								class="flex-1"
								required
							/>
						</div>
						<div class="flex flex-row items-center gap-1 px-4 w-full">
							<img src="/images/medals/diamond.webp" alt="Diamond" class="w-8 h-8 pixelated" />
							<Label class="flex-1">Diamond</Label>
							<NumberInput
								min={0}
								max={1_000}
								name="diamond"
								value={medalWeights['Diamond']}
								maxlength={64}
								class="flex-1"
								required
							/>
						</div>
					</div>
					<div class="flex flex-row gap-2">
						<Button
							variant="destructive"
							disabled={pending}
							on:click={() => {
								medalWeights = structuredClone(defaults?.medalValues ?? {});
							}}>Reset Values</Button
						>
						<Button type="submit" disabled={pending}>Update</Button>
					</div>
				</form>
			{/if}
		{/await}
	</div>
</main>

<Dialog.Root bind:open={banMemberModal}>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
		<Dialog.Title>{banMemberName} - {banMemberUuid}</Dialog.Title>
		<form
			method="post"
			action="?/banmember"
			class="flex flex-col gap-2"
			use:enhance={() => {
				pending = true;
				return async ({ result, update }) => {
					if (result) banMemberModal = false;
					pending = false;
					update();
				};
			}}
		>
			<input type="hidden" name="id" bind:value={data.event.id} />
			<input type="hidden" name="uuid" bind:value={banMemberUuid} />
			<div class="space-y-2">
				<Label>Ban Reason</Label>
				<Input name="reason" placeholder="Cheating - Macro" maxlength={64} required />
			</div>

			<Button type="submit" disabled={pending}>Ban</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={clickOutsideModalEdit}>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
		<Dialog.Title>Edit Event</Dialog.Title>
		<p>Only fill in fields that you want to be changed.</p>
		<form
			method="post"
			action="?/edit"
			class="flex flex-col gap-2"
			use:enhance={() => {
				pending = true;
				return async ({ result, update }) => {
					if (result) clickOutsideModalEdit = false;
					pending = false;
					update();
				};
			}}
		>
			<input type="text" name="id" bind:value={data.event.id} hidden />
			<div class="space-y-2">
				<Label>Event Name</Label>
				<Input name="title" placeholder="Farming Weight Challenge" maxlength={64} />
			</div>
			<div class="space-y-2">
				<Label>Event Description</Label>
				<Textarea name="description" placeholder="Farm as much as you can in 24 hours!" maxlength={1024} />
			</div>
			<div class="space-y-2">
				<Label>Event Rules</Label>
				<Textarea name="rules" placeholder="No cheating." maxlength={1024} />
			</div>
			<div class="space-y-2">
				<Label>Event Prizes</Label>
				<Textarea name="prizes" placeholder="First Place: $20 in Gems!" maxlength={1024} />
			</div>
			<div class="space-y-2 mt-4">
				<Label>Event Start Time</Label>
				<Input name="startDate" type="datetime-local" />
			</div>
			<div class="space-y-2">
				<Label>Event End Time</Label>
				<Input name="endDate" type="datetime-local" />
			</div>
			<div class="space-y-2 mb-4">
				<Label>Join Until Time</Label>
				<Input name="joinDate" type="datetime-local" />
			</div>

			<Button type="submit" disabled={pending}>Edit Event</Button>
			<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={clickOutsideModalEditImage}>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
		<Dialog.Title>Edit Event Banner</Dialog.Title>
		<p>Upload a .png image for use as the event banner!</p>
		<form
			method="post"
			action="?/banner"
			class="flex flex-col gap-2"
			enctype="multipart/form-data"
			use:enhance={() => {
				pending = true;
				return async ({ result, update }) => {
					if (result) clickOutsideModalEditImage = false;
					pending = false;
					update();
				};
			}}
		>
			<input type="text" name="id" bind:value={data.event.id} hidden />
			<div class="space-y-2">
				<Label>Banner Image File</Label>
				<Input name="image" accept=".png" type="file" />
			</div>

			<div class="flex flex-row items-center gap-2">
				<Button type="submit" disabled={pending}>Submit Image</Button>
				<Button disabled={pending} type="submit" formaction="?/clearbanner" variant="destructive"
					>Clear Banner</Button
				>
			</div>
			<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.Content>
</Dialog.Root>
