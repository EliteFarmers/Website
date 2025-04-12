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
	import Settings from 'lucide-svelte/icons/settings';
	import Image from 'lucide-svelte/icons/image';
	import Head from '$comp/head.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import { EventType } from '$lib/utils';
	import type { PageData } from './$types';
	import { NumberInput } from '$comp/ui/number-input';
	import type { components } from '$lib/api/api';
	import { Crop, getCropDisplayName, getCropFromName, Pest } from 'farming-weight';
	import { CROP_TO_ELITE_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import HeroBanner from '$comp/hero-banner.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { page } from '$app/state';
	import MemberList from './member-list.svelte';
	import TooltipSimple from '$ui/tooltip/tooltip-simple.svelte';

	interface Props {
		data: PageData;
	}

	let { data = $bindable() }: Props = $props();

	let members = $derived(data.members);
	let bans = $derived(data.bans);
	let teams = $derived(data.teams);
	let defaults = $derived(data.defaults);

	let clickOutsideModalEdit = $state(false);
	let clickOutsideModalEditImage = $state(false);
	let pending = $state(false);

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
	let pestWeights = $state(
		((data.event?.data as components['schemas']['PestEventData'])?.pestWeights ?? undefined) as
			| Record<string, number>
			| undefined
	);
	let collectionWeights = $state(
		((data.event?.data as components['schemas']['CollectionEventData'])?.collectionWeights ?? undefined) as
			| Record<string, { weight: number; name: string }>
			| undefined
	);
	let newCollectionKey = $state('');

	const favorites = getFavoritesContext();
	favorites.setPage({
		icon: data.guild.icon?.url ?? undefined,
		name: 'Edit ' + (data.event?.name ?? 'Event'),
		href: page.url.pathname,
	});
</script>

<Head title={data.event.name ?? 'Event'} description="Manage Events happening in your guild" />

<HeroBanner src={event.banner?.url} class="h-48">
	<div class="mb-6 mt-8 flex flex-row items-center justify-center gap-4 rounded-lg bg-zinc-900/75 p-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="xs:text-2xl mx-8 text-xl text-white sm:text-3xl md:text-4xl">
			{data.event?.name}
		</h1>
	</div>
</HeroBanner>

<div class="mt-64 flex flex-col items-center gap-4">
	<section class="flex w-full max-w-7xl flex-col items-center justify-center justify-items-center gap-8">
		<div
			class="flex w-[90%] max-w-screen-lg flex-col justify-center justify-items-center rounded-md border-2 bg-card p-4 md:w-[70%]"
		>
			<div class="flex flex-row justify-between gap-2 p-4">
				<div class="flex flex-col gap-2">
					<div class="flex flex-row items-center gap-2">
						{#if !event.approved}
							<Popover.Mobile>
								{#snippet trigger()}
									<TriangleAlert class="mt-1.5 text-destructive" />
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
					<TooltipSimple side="left">
						{#snippet child({ props })}
							<Button
								onclick={() => {
									clickOutsideModalEdit = true;
								}}
								{...props}
							>
								<Settings />
							</Button>
						{/snippet}
						<div>
							<p>Edit Event</p>
						</div>
					</TooltipSimple>

					<TooltipSimple side="left">
						{#snippet child({ props })}
							<Button
								onclick={() => {
									clickOutsideModalEditImage = true;
								}}
								{...props}
							>
								<Image />
							</Button>
						{/snippet}
						<div>
							<p>Edit Banner Image</p>
						</div>
					</TooltipSimple>

					{#if event.approved}
						<TooltipSimple side="left">
							{#snippet child({ props })}
								<Button href="/event/{event.id}" target="_blank" {...props}>
									<ExternalLink />
								</Button>
							{/snippet}
							<div>
								<p>View Event Page</p>
							</div>
						</TooltipSimple>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<div class="flex max-w-md flex-row items-center justify-center">
		<Button href="/guild/{data.guild.id}/events" variant="secondary">Back to Events</Button>
	</div>

	<MemberList members={(members ?? []).concat(bans ?? [])} {teams} {event} teamWords={data.teamWords} />

	<div class="flex flex-col rounded-md border-2 bg-card p-4">
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
				<p class="text-sm leading-relaxed text-muted-foreground">
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
		{:else if event.type === +EventType.Pests && pestWeights}
			<form
				action="?/editPestWeights"
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
				<h4 class="mb-4 text-lg">Pest Weight Values</h4>

				<div class="flex max-w-4xl flex-col items-center justify-center gap-1 md:flex-row md:flex-wrap">
					{#each Object.entries(pestWeights ?? {}) as [pestName] (pestName)}
						{@const pest = Pest[pestName as keyof typeof Pest] ?? 'earthworm'}

						<div class="flex flex-row items-center gap-1 px-4 md:basis-96">
							<img src="/images/pests/{pest}.png" alt={pestName} class="pixelated size-8" />
							<Label class="flex-1">{pestName}</Label>
							<NumberInput
								min={0}
								max={1_000_000}
								name={pestName}
								value={pestWeights[pestName]}
								maxlength={64}
								class="flex-1"
								required
							/>
						</div>
					{/each}
				</div>

				<div class="flex flex-row gap-2">
					<Button
						variant="destructive"
						disabled={pending}
						onclick={() => {
							pestWeights = structuredClone(defaults?.pestWeights ?? {});
						}}>Reset Values</Button
					>
					<Button type="submit" disabled={pending}>Update</Button>
				</div>
			</form>
		{:else if event.type === +EventType.Collections && collectionWeights}
			<form
				action="?/editCollectionWeights"
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
				<h4 class="mb-4 text-lg">Collections</h4>

				<div class="flex max-w-4xl flex-col items-center justify-center gap-1">
					{#each Object.entries(collectionWeights ?? {}) as [key, pair] (key)}
						{@const name = pair.name}
						{@const weight = pair.weight}

						<div class="flex w-full flex-row items-center gap-1 px-4">
							<Label class="flex-1 font-semibold">{key}</Label>
							<Input
								name="collection.{key}.name"
								value={name}
								placeholder="Collection Name"
								maxlength={64}
								class="flex-1"
								required
							/>
							<NumberInput
								min={0}
								max={1_000_000}
								name="collection.{key}.value"
								placeholder="Weight Value"
								value={weight}
								maxlength={64}
								class="flex-1"
								required
							/>
							<Button
								type="button"
								onclick={() => {
									delete collectionWeights[key];
								}}
								variant="destructive"
							>
								<Trash2 size={16} />
							</Button>
						</div>
					{:else}
						<p class="text-sm leading-relaxed text-muted-foreground">No collections have been added yet.</p>
					{/each}
				</div>

				<div class="mt-4 flex flex-row items-center gap-1 px-4">
					<Label class="flex-1">New Collection Key</Label>
					<Input name="collectionKey" bind:value={newCollectionKey} maxlength={64} class="flex-1" />
					<Button
						type="button"
						onclick={() => {
							if (newCollectionKey.trim() === '') return;
							collectionWeights[newCollectionKey] = {
								name: newCollectionKey.trim(),
								weight: 1,
							};
							newCollectionKey = '';
						}}
						variant="secondary"
					>
						Add
					</Button>
				</div>

				<p class="text-sm leading-relaxed text-muted-foreground">
					Enter internal SkyBlock IDs / item ids for collections. It's whatever Hypixel has as a key in the
					collections object.
				</p>

				<div class="flex flex-row gap-2">
					<Button type="submit" disabled={pending}>Update</Button>
				</div>
			</form>
		{:else}
			<p>Event Type not supported</p>
		{/if}
	</div>
	<div class="flex flex-col rounded-md border-2 bg-card p-4">
		<form
			action="?/forceAddMember"
			method="post"
			class="flex flex-col gap-2"
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
			<h4 class="text-lg">Force Add Member</h4>
			<p class="max-w-lg text-sm">
				This should be used very sparingly, and only with the consent of who is being added.
			</p>

			<div class="flex flex-row gap-2">
				<Input name="uuid" placeholder="Player UUID" maxlength={32} required class="flex-1" />
				<Input name="profile" placeholder="Profile UUID" maxlength={32} required class="flex-1" />
				<Button type="submit" disabled={pending}>Add</Button>
			</div>
		</form>
	</div>
	<div class="flex flex-col rounded-md border-2 bg-card p-4">
		<form
			action="?/permDeleteMember"
			method="post"
			class="flex flex-col gap-2"
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
			<h4 class="text-lg">Delete Member Entry</h4>
			<p class="max-w-lg text-sm">
				This irreversibly deletes the database entry for a member. They will be able to join again. Only use
				this if absolutely necessary.
			</p>

			<div class="flex flex-row gap-2">
				<Input name="uuid" placeholder="Player UUID" maxlength={32} required class="flex-1" />
				<Button type="submit" disabled={pending} variant="destructive">Delete</Button>
			</div>
		</form>
	</div>
</div>

<Dialog.Root bind:open={clickOutsideModalEdit}>
	<Dialog.ScrollContent>
		<Dialog.Title>Edit Event</Dialog.Title>
		<p>Only fill in fields that you want to be changed.</p>
		<form
			method="post"
			action="?/edit"
			class="mx-1 flex flex-col gap-2"
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
			<p class="text-base leading-relaxed text-muted-foreground">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.ScrollContent>
</Dialog.Root>

<Dialog.Root bind:open={clickOutsideModalEditImage}>
	<Dialog.ScrollContent>
		<Dialog.Title>Edit Event Banner</Dialog.Title>
		<p class="mt-4">Upload a .png image for use as the event banner!</p>
		<form
			method="post"
			action="?/banner"
			class="mx-1 flex flex-col gap-2"
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
			<p class="text-base leading-relaxed text-muted-foreground">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.ScrollContent>
</Dialog.Root>
