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

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data = $bindable(), form }: Props = $props();

	let clickOutsideModalEdit = $state(false);
	let clickOutsideModalEditImage = $state(false);
	let pending = $state(false);

	let banMemberModal = $state(false);

	let banMemberName = $state('');
	let banMemberUuid = $state('');

	let memberLimit = $state(10);
	let bansLimit = $state(10);

	function sort(a: { score?: string | null } | undefined, b: { score?: string | null } | undefined) {
		return +(b?.score ?? 0) - +(a?.score ?? 0);
	}

	let event = $derived(data.event);

	let medalWeights = $state(
		((data.event?.data as components['schemas']['MedalEventData'])?.medalWeights ?? undefined) as
			| Record<string, number>
			| undefined
	);
	let cropWeights = $state(
		((data.event?.data as components['schemas']['WeightEventData'])?.cropWeights ?? undefined) as
			| Record<string, number>
			| undefined
	);
</script>

<Head title="Events" description="Manage Events happening in your guild" />

<main class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="my-16 text-4xl">
			{event?.name}
		</h1>
	</div>

	{#if form?.error}
		<h5 class="text-xl font-semibold text-red-700">
			<p>{form?.error}</p>
		</h5>
	{/if}

	<section class="flex w-full max-w-4xl flex-col items-center justify-center justify-items-center gap-8">
		<div
			class="flex w-[90%] max-w-screen-lg flex-col justify-center justify-items-center rounded-md bg-primary-foreground p-4 md:w-[70%]"
		>
			<div class="flex flex-row justify-between gap-2 p-4">
				<div class="flex flex-col gap-2">
					<div class="flex flex-row items-center gap-2">
						{#if !event.approved}
							<Popover.Mobile>
								{#snippet trigger()}
									<div>
										<TriangleAlert class="mt-1.5 text-red-500" />
									</div>
								{/snippet}
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
					<div class="flex flex-col justify-start gap-2 text-lg font-semibold md:flex-row md:items-center">
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
				<div class="flex flex-col gap-2 p-4">
					<Popover.Mobile>
						{#snippet trigger()}
							<Button
								onclick={() => {
									clickOutsideModalEdit = true;
								}}
							>
								<Settings />
							</Button>
						{/snippet}
						<div>
							<p>Edit Event</p>
						</div>
					</Popover.Mobile>

					<Popover.Mobile>
						{#snippet trigger()}
							<Button
								onclick={() => {
									clickOutsideModalEditImage = true;
								}}
							>
								<Image />
							</Button>
						{/snippet}
						<div>
							<p>Edit Banner Image</p>
						</div>
					</Popover.Mobile>

					{#if event.approved}
						<Popover.Mobile>
							{#snippet trigger()}
								<div>
									<Button href="/event/{event.id}" target="_blank">
										<ExternalLink />
									</Button>
								</div>
							{/snippet}
							<div>
								<p>View Event Page</p>
							</div>
						</Popover.Mobile>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<div class="flex max-w-md flex-row items-center justify-center">
		<Button href="/guild/{data.guild.id}/events" variant="secondary">Back to Events</Button>
	</div>

	<div class="flex w-full max-w-6xl flex-col items-start justify-center gap-8 px-4 md:flex-row">
		<section class="flex w-full flex-1 flex-col gap-4 rounded-md bg-primary-foreground p-4">
			<h3 class="text-xl">Event Members</h3>
			<div class="flex w-full flex-1 flex-col items-center justify-center gap-2">
				{#await data.members}
					<p>Loading...</p>
				{:then members}
					{@const m = (members ?? []).sort(sort)}
					{#each m.slice(0, memberLimit) as member (member.playerUuid + '' + member.id)}
						<Member {member}>
							<Popover.Mobile>
								{#snippet trigger()}
									<Button
										size="sm"
										onclick={() => {
											banMemberName = member.playerName ?? '';
											banMemberUuid = member.playerUuid ?? '';
											banMemberModal = true;
										}}
									>
										<Trash2 size={16} class="text-destructive" />
									</Button>
								{/snippet}
								<div>
									<p>Ban this user from the event</p>
								</div>
							</Popover.Mobile>
						</Member>
					{/each}
					{#if m.length > memberLimit}
						<Button
							variant="secondary"
							onclick={() => {
								memberLimit += m.length;
							}}
						>
							Show All
						</Button>
					{:else if memberLimit > 10}
						<Button
							variant="secondary"
							onclick={() => {
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
		<section class="flex flex-1 flex-col gap-4 rounded-md bg-primary-foreground p-4">
			<h3 class="text-xl">Removed Event Members</h3>
			<div class="flex w-full flex-col items-center justify-center justify-items-center gap-2">
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
									{#snippet trigger()}
										<div>
											<Button type="submit" color="green" class="unban" size="sm">
												<ArrowUp size={16} />
											</Button>
										</div>
									{/snippet}
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
							onclick={() => {
								bansLimit += b.length;
							}}
						>
							Show All
						</Button>
					{:else if bansLimit > 10}
						<Button
							variant="secondary"
							onclick={() => {
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
	<div class="flex flex-col rounded-md bg-primary-foreground p-4">
		{#await data.defaults}
			<p>Loading...</p>
		{:then defaults}
			{#if event.type === +EventType.FarmingWeight && cropWeights}
				<form
					action="?/editCropWeights"
					method="post"
					class="flex flex-col items-center gap-2"
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
					<h4 class="mb-4 text-lg">Crop Weight Values</h4>

					<div class="flex max-w-4xl flex-col items-center justify-center gap-1 md:flex-row md:flex-wrap">
						{#each Object.entries(defaults?.cropWeights ?? {}) as [crop] (crop)}
							{@const c = getCropFromName(crop) ?? Crop.Wheat}
							{@const cropName = getCropDisplayName(c)}
							{@const name = CROP_TO_ELITE_CROP[c]}

							<div class="flex flex-row items-center gap-1 px-4 md:basis-96">
								<img src={PROPER_CROP_TO_IMG[cropName]} alt={crop} class="pixelated h-8 w-8" />
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
							onclick={() => {
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
					class="flex flex-col items-center gap-2"
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
					<h4 class="mb-4 text-lg">Medal Point Values</h4>

					<div class="flex max-w-4xl flex-col items-center justify-center gap-1">
						<div class="flex w-full flex-row items-center gap-1 px-4">
							<img src="/images/medals/bronze.webp" alt="Bronze" class="pixelated h-8 w-8" />
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
						<div class="flex w-full flex-row items-center gap-1 px-4">
							<img src="/images/medals/silver.webp" alt="Silver" class="pixelated h-8 w-8" />
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
						<div class="flex w-full flex-row items-center gap-1 px-4">
							<img src="/images/medals/gold.webp" alt="Gold" class="pixelated h-8 w-8" />
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
						<div class="flex w-full flex-row items-center gap-1 px-4">
							<img src="/images/medals/platinum.webp" alt="Platinum" class="pixelated h-8 w-8" />
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
						<div class="flex w-full flex-row items-center gap-1 px-4">
							<img src="/images/medals/diamond.webp" alt="Diamond" class="pixelated h-8 w-8" />
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
							onclick={() => {
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
	<Dialog.Content class="max-h-[80%] overflow-scroll">
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
	<Dialog.Content class="max-h-[80%] overflow-scroll">
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
			<div class="mt-4 space-y-2">
				<Label>Event Start Time</Label>
				<Input name="startDate" type="datetime-local" />
			</div>
			<div class="space-y-2">
				<Label>Event End Time</Label>
				<Input name="endDate" type="datetime-local" />
			</div>
			<div class="mb-4 space-y-2">
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
	<Dialog.Content class="max-h-[80%] overflow-scroll">
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
