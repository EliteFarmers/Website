<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Textarea } from '$ui/textarea';
	import * as Dialog from '$ui/dialog';
	import { applyAction, enhance } from '$app/forms';

	import type { PageData, ActionData } from './$types';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import { leaderboardStyleParse, weightStyleParse } from '$lib/styles/style';
	import { untrack } from 'svelte';
	import Switch from '$comp/ui/switch/switch.svelte';
	import X from '@lucide/svelte/icons/x';
	import { pending } from '$lib/utils';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import EntryPreview from '$comp/leaderboards/entry-preview.svelte';
	import { PersistedState } from 'runed';
	import type { components } from '$lib/api/api';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let style = $derived(data.style);
	let loading = $state(false);
	let deleteStyleModal = $state(false);
	let showLeaderboardName = new PersistedState('showleaderboardname', false);

	let badge = $state(data.badges?.[0]?.image?.url ?? undefined);
	let rank = $state(1000);
	let showBadge = $state(false);
	let badgeUrl = $derived(showBadge ? badge : undefined);

	let styleData = $derived(JSON.stringify(data.style.data ?? {}, undefined, 2) + '');
	let styleDataValid = $derived.by(() => {
		try {
			const s = JSON.parse(styleData);
			return weightStyleParse(s);
		} catch {
			return undefined;
		}
	});

	let leaderboardData = $derived(JSON.stringify(data.style.leaderboard ?? {}, undefined, 2) + '');
	let leaderboardDataValid = $derived.by(() => {
		try {
			const l = JSON.parse(leaderboardData);
			return leaderboardStyleParse(l);
		} catch {
			console.log('Invalid leaderboard data');
			return undefined;
		}
	});

	let deleteImageModal = $state(false);
	let selectedImageId = $state('');

	let styleDataObj = $derived({
		...untrack(() => data.style),
		data: (styleDataValid?.success ? styleDataValid.data : data.style.data) as
			| components['schemas']['WeightStyleDataDto']
			| undefined,
		leaderboard: (leaderboardDataValid?.success ? leaderboardDataValid.data : data.style.leaderboard) as
			| components['schemas']['LeaderboardStyleDataDto']
			| undefined,
	});

	let crumbs = $derived<Crumb[]>([
		{
			name: 'Admin',
			href: '/admin',
		},
		{
			name: 'Styles',
			href: '/admin/styles',
		},
		{
			name: style.name ?? 'Style',
		},
	]);

	const breadcrumb = getBreadcrumb();

	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});
</script>

<Head title="Style" description="Manage style" />

<div class="my-16">
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-8 flex flex-row items-center gap-4">
			<h1 class="text-4xl">{style.name}</h1>
		</div>

		{#if style.description}
			<p>{style.description}</p>
		{/if}

		{#if form?.error}
			<p class="text-destructive">{form.error}</p>
		{/if}
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Update Settings</h2>
		</div>
		<form method="post" action="?/updateStyle" class="flex flex-1 flex-col gap-4" use:enhance>
			<input type="hidden" name="style" value={style.id} />

			<div class="flex max-w-64 flex-col items-start gap-2">
				<Label>Style Name</Label>
				<Input name="name" value={style.name} required />
			</div>

			<div class="flex max-w-2xl flex-col items-start gap-2">
				<Label>Style Description</Label>
				<Textarea name="description" value={style.description} maxlength={1024} required />
			</div>

			<Button class="max-w-32" type="submit" disabled={loading}>Update</Button>
		</form>
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Update Style Design</h2>
		</div>

		<div class="h-36 max-h-36 max-w-2xl overflow-y-auto pr-2">
			{#if !styleDataValid?.success || !styleDataObj}
				<p class="text-destructive mb-2">Invalid style data.</p>
				{#if styleDataValid?.error?.issues}
					<div class="flex flex-col gap-1">
						{#each styleDataValid.error.issues as issue, i (i)}
							<div class="border-card flex flex-col gap-1 rounded-sm border-2 p-2">
								<p>{issue.path.join('.')}</p>
								<p>{issue.message}</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground">
						Data is invalid JSON, please make sure all properties are double quoted and check for missing
						commas.
					</p>
				{/if}
			{:else if styleDataObj}
				<div class="max-h-36">
					{#key badgeUrl}
						<WeightStyle
							style={styleDataObj}
							ign={data.user.username ?? 'Steve'}
							uuid={data.user.username ?? 'Steve'}
							{rank}
							{badgeUrl}
						/>
					{/key}
				</div>
			{/if}
		</div>

		<div class="flex w-full gap-4 md:flex-row lg:flex-row">
			<form
				method="post"
				action="?/updateStyle"
				class="flex flex-1 flex-col gap-4"
				use:enhance={() => {
					loading = true;

					return async ({ result }) => {
						await applyAction(result);
						loading = false;
					};
				}}
			>
				<input type="hidden" name="style" value={style.id} />
				<input type="hidden" name="name" value={style.name} />
				<input type="hidden" name="description" value={style.description} />

				<div class="flex max-w-2xl flex-col items-start gap-2">
					<Textarea
						spellcheck={false}
						writingsuggestions={false}
						class="h-96 font-mono"
						name="data"
						bind:value={styleData}
					/>
				</div>

				<div class="flex flex-row items-center gap-4">
					<Button class="w-32" type="submit" disabled={loading}>Update</Button>
					<div class="flex flex-row items-center gap-2">
						<Switch bind:checked={showBadge} />
						<Label class="leading-none">Show Badge</Label>
					</div>
				</div>
			</form>
		</div>
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Update Leaderboard Style</h2>
		</div>

		<div class="max-w-2xl overflow-y-auto pr-2">
			{#if !leaderboardDataValid?.success || !styleDataObj}
				<p class="text-destructive mb-2">Invalid style data.</p>
				{#if leaderboardDataValid?.error?.issues}
					<div class="flex flex-col gap-1">
						{#each leaderboardDataValid.error.issues as issue, i (i)}
							<div class="border-card flex flex-col gap-1 rounded-sm border-2 p-2">
								<p>{issue.path.join('.')}</p>
								<p>{issue.message}</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground">
						Data is invalid JSON, please make sure all properties are double quoted and check for missing
						commas.
					</p>
				{/if}
			{:else if styleDataObj}
				<div class="max-h-16">
					<EntryPreview
						style={leaderboardDataValid.data}
						ign={data.user.username ?? 'Steve'}
						uuid={data.user.username ?? 'Steve'}
						showLeaderboardName={showLeaderboardName.current}
						styleId={style.id}
					/>
				</div>
			{/if}
		</div>

		<div class="flex w-full gap-4 md:flex-row lg:flex-row">
			<form
				method="post"
				action="?/updateLeaderboardStyle"
				class="flex flex-1 flex-col gap-4"
				use:enhance={() => {
					loading = true;

					return async ({ result }) => {
						await applyAction(result);
						loading = false;
					};
				}}
			>
				<input type="hidden" name="style" value={style.id} />
				<input type="hidden" name="name" value={style.name} />
				<input type="hidden" name="description" value={style.description} />

				<div class="flex max-w-2xl flex-col items-start gap-2">
					<Textarea
						spellcheck={false}
						writingsuggestions={false}
						class="h-96 font-mono"
						name="data"
						bind:value={leaderboardData}
					/>
				</div>

				<div class="flex flex-row items-center gap-4">
					<Button class="w-32" type="submit" disabled={loading}>Update</Button>
					<div class="flex flex-row items-center gap-2">
						<Switch bind:checked={showLeaderboardName.current} />
						<Label class="leading-none">Show Leaderboard Name</Label>
					</div>
				</div>
			</form>
		</div>
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Images</h2>
		</div>

		<div class="mb-4 flex flex-row">
			{#if style.image}
				<img
					src={style.image.url}
					alt={style.image.title ?? 'Style thumbnail'}
					class="h-32 w-32 rounded-md object-cover"
				/>
			{/if}
			{#each style.images ?? [] as image, i (i)}
				<div class="flex flex-col items-center gap-2 rounded-md border p-1">
					<img src={image.url} alt={image.title} class="h-32 w-32 rounded-md object-cover" />
					{#if image.title}
						<p>{image.title}</p>
					{/if}
					<div class="flex flex-row items-center gap-4">
						<Button
							variant="destructive"
							size="sm"
							onclick={() => {
								selectedImageId = image.url ?? '';
								deleteImageModal = true;
							}}
						>
							<X size={16} />
						</Button>

						<CopyToClipboard text={image.url} class="px-3" variant="outline" />
					</div>
					{#if image.description}
						<p>{image.description}</p>
					{/if}
				</div>
			{/each}
			{#if !style.image && !(style.images ?? []).length}
				<p>No images!</p>
			{/if}
		</div>

		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Add Image</h2>
		</div>
		<form
			method="post"
			action="?/addImage"
			enctype="multipart/form-data"
			class="flex max-w-lg flex-1 flex-col gap-4"
			use:pending={loading}
		>
			<input type="hidden" name="style" bind:value={style.id} />

			<div class="flex flex-col items-start gap-2">
				<Label>Image</Label>
				<Input type="file" name="image" accept=".png" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Image Title</Label>
				<Input name="title" placeholder="Title" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Image Description</Label>
				<Input name="description" placeholder="Description" />
			</div>

			<Button type="submit" disabled={loading} class="w-fit px-4">Add Image</Button>
		</form>
	</section>

	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Options</h2>
		</div>

		<div class="flex flex-row gap-2">
			<form method="post" action="?/duplicate" use:enhance>
				<input type="hidden" name="style" value={style.id} />
				<Button size="sm" type="submit" class="max-w-32">Duplicate Style</Button>
			</form>
			<Button
				variant="destructive"
				size="sm"
				class="max-w-32"
				onclick={() => {
					deleteStyleModal = true;
				}}
			>
				Delete Style
			</Button>
		</div>
	</section>
</div>

<Dialog.Root bind:open={deleteStyleModal}>
	<Dialog.Content class="max-h-[80%] overflow-auto">
		<Dialog.Title>Delete Style</Dialog.Title>
		<form
			action="?/deleteStyle"
			method="post"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result) deleteStyleModal = false;
					update();
				};
			}}
		>
			<input type="hidden" name="style" value={style.id} />
			<p>Are you sure you want to delete this style?</p>
			<Button type="submit" disabled={loading} variant="destructive">Delete</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteImageModal}>
	<Dialog.Content class="max-h-[80%] overflow-auto">
		<Dialog.Title>Delete Image</Dialog.Title>
		<form
			action="?/deleteImage"
			method="post"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result) deleteImageModal = false;
					update();
				};
			}}
		>
			<input type="hidden" name="style" bind:value={style.id} />
			<input type="hidden" name="image" bind:value={selectedImageId} />
			<p>Are you sure you want to delete this image?</p>
			<Button type="submit" disabled={loading} variant="destructive">Delete</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
