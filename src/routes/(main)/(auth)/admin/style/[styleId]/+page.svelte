<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { LeaderboardStyleEditor, WeightStyleEditor } from '$comp/admin/style-editor';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import Head from '$comp/head.svelte';
	import EntryPreview from '$comp/leaderboards/entry-preview.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import Switch from '$comp/ui/switch/switch.svelte';
	import type { LeaderboardStyleDataDto, WeightStyleDataDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import type { LeaderboardStyle as LeaderboardStyleType, WeightStyle as WeightStyleType } from '$lib/styles/style';
	import { leaderboardStyleParse, weightStyleParse } from '$lib/styles/style';
	import { pending } from '$lib/utils';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Tabs from '$ui/tabs';
	import { Textarea } from '$ui/textarea';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Trash_2 from '@lucide/svelte/icons/trash-2';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import { PersistedState } from 'runed';
	import { untrack } from 'svelte';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let style = $derived(data.style);
	let loading = $state(false);
	let deleteStyleModal = $state(false);
	let reassignAccountId = $state('');
	let showLeaderboardName = new PersistedState('showleaderboardname', false);

	let badge = $derived(data.badges?.[0]?.image?.url ?? undefined);
	let rank = $state(1000);
	let showBadge = $state(false);
	let badgeUrl = $derived(showBadge ? badge : undefined);

	// Visual editor state
	let styleEditorMode = new PersistedState<'visual' | 'json'>('styleEditorMode', 'visual');
	let leaderboardEditorMode = new PersistedState<'visual' | 'json'>('leaderboardEditorMode', 'visual');

	let weightStyleObj = $derived<WeightStyleType>(
		structuredClone(data.style.data ?? { elements: { background: {} } }) as WeightStyleType
	);
	let leaderboardStyleObj = $derived<LeaderboardStyleType>(
		structuredClone(data.style.leaderboard ?? {}) as LeaderboardStyleType
	);

	let styleJsonText = $derived(JSON.stringify(data.style.data ?? {}, undefined, 2));
	let leaderboardJsonText = $derived(JSON.stringify(data.style.leaderboard ?? {}, undefined, 2));

	// Sync visual editor -> JSON when switching to JSON mode
	function syncStyleToJson() {
		styleJsonText = JSON.stringify(weightStyleObj, undefined, 2);
	}
	function syncLeaderboardToJson() {
		leaderboardJsonText = JSON.stringify(leaderboardStyleObj, undefined, 2);
	}

	// Sync JSON -> visual editor when switching to visual mode
	function syncJsonToStyle() {
		try {
			const parsed = JSON.parse(styleJsonText);
			const result = weightStyleParse(parsed);
			if (result.success) {
				weightStyleObj = result.data as WeightStyleType;
			}
		} catch {
			// Keep current visual state if JSON is invalid
		}
	}
	function syncJsonToLeaderboard() {
		try {
			const parsed = JSON.parse(leaderboardJsonText);
			const result = leaderboardStyleParse(parsed);
			if (result.success) {
				leaderboardStyleObj = result.data as LeaderboardStyleType;
			}
		} catch {
			// Keep current visual state if JSON is invalid
		}
	}

	// Recursively ensure all numeric values are not undefined (coerce undefined → 0)
	// JSON.stringify drops undefined, which causes zod to reject required number fields
	function cleanNumbers(obj: unknown): unknown {
		if (obj === null || obj === undefined) return obj;
		if (typeof obj !== 'object') return obj;
		if (Array.isArray(obj)) return obj.map(cleanNumbers);
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(obj)) {
			if (val === undefined) continue;
			result[key] = typeof val === 'object' ? cleanNumbers(val) : val;
		}
		// Ensure Position-like objects keep x/y as numbers
		if ('x' in result && result.x == null) result.x = 0;
		if ('y' in result && result.y == null) result.y = 0;
		// Ensure gradient stop position is a number
		if ('position' in result && 'fill' in result && result.position == null) result.position = 0;
		return result;
	}

	// Derive the serialized form data for submission
	let styleFormData = $derived.by(() => {
		if (styleEditorMode.current === 'visual') {
			return JSON.stringify(cleanNumbers(weightStyleObj));
		}
		return styleJsonText;
	});
	let leaderboardFormData = $derived.by(() => {
		if (leaderboardEditorMode.current === 'visual') {
			return JSON.stringify(cleanNumbers(leaderboardStyleObj));
		}
		return leaderboardJsonText;
	});

	// Validation for preview
	let styleDataValid = $derived.by(() => {
		try {
			const s = JSON.parse(styleFormData);
			return weightStyleParse(s);
		} catch {
			return undefined;
		}
	});
	let leaderboardDataValid = $derived.by(() => {
		try {
			const l = JSON.parse(leaderboardFormData);
			return leaderboardStyleParse(l);
		} catch {
			return undefined;
		}
	});

	let deleteImageModal = $state(false);
	let selectedImageId = $state('');

	let styleDataObj = $derived({
		...untrack(() => data.style),
		data: (styleDataValid?.success ? styleDataValid.data : data.style.data) as WeightStyleDataDto | undefined,
		leaderboard: (leaderboardDataValid?.success ? leaderboardDataValid.data : data.style.leaderboard) as
			| LeaderboardStyleDataDto
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

	const ctx = getGlobalContext();

	const breadcrumb = getPageCtx();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
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
							ign={ctx.user?.username ?? 'Steve'}
							uuid={ctx.user?.username ?? 'Steve'}
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
				<input type="hidden" name="data" value={styleFormData} />

				<Tabs.Root
					bind:value={styleEditorMode.current}
					onValueChange={(v) => {
						if (v === 'json') syncStyleToJson();
						else if (v === 'visual') syncJsonToStyle();
					}}
				>
					<Tabs.List>
						<Tabs.Trigger value="visual">Visual</Tabs.Trigger>
						<Tabs.Trigger value="json">JSON</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="visual">
						<div class="max-h-128 max-w-2xl overflow-y-auto py-2 pr-2">
							<WeightStyleEditor bind:value={weightStyleObj} imageRefs={style.imageRefs ?? {}} />
						</div>
					</Tabs.Content>
					<Tabs.Content value="json">
						<div class="flex max-w-2xl flex-col items-start gap-2">
							<Textarea
								spellcheck={false}
								writingsuggestions={false}
								class="h-96 font-mono"
								bind:value={styleJsonText}
							/>
						</div>
					</Tabs.Content>
				</Tabs.Root>

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
						ign={ctx.user?.username ?? 'Steve'}
						uuid={ctx.user?.username ?? 'Steve'}
						showLeaderboardName={showLeaderboardName.current}
						styleId={style.id}
						imageRefs={style.imageRefs}
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
				<input type="hidden" name="data" value={leaderboardFormData} />

				<Tabs.Root
					bind:value={leaderboardEditorMode.current}
					onValueChange={(v) => {
						if (v === 'json') syncLeaderboardToJson();
						else if (v === 'visual') syncJsonToLeaderboard();
					}}
				>
					<Tabs.List>
						<Tabs.Trigger value="visual">Visual</Tabs.Trigger>
						<Tabs.Trigger value="json">JSON</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="visual">
						<div class="max-h-128 max-w-2xl overflow-y-auto py-2 pr-2">
							<LeaderboardStyleEditor
								bind:value={leaderboardStyleObj}
								imageRefs={style.imageRefs ?? {}}
							/>
						</div>
					</Tabs.Content>
					<Tabs.Content value="json">
						<div class="flex max-w-2xl flex-col items-start gap-2">
							<Textarea
								spellcheck={false}
								writingsuggestions={false}
								class="h-96 font-mono"
								bind:value={leaderboardJsonText}
							/>
						</div>
					</Tabs.Content>
				</Tabs.Root>

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
				{@const ref = Object.entries(style.imageRefs ?? {}).find(([, value]) => value.url === image.url)?.[0]}
				<div class="flex flex-row items-center gap-2 rounded-md border p-1">
					<img src={image.url} alt={image.title} class="h-32 w-32 rounded-md object-cover" />
					<div class="flex flex-col gap-2">
						{#if image.title}
							<p>{image.title}</p>
						{/if}
						<p class="text-sm">Image Reference</p>
						<span class="text-muted-foreground text-xs"
							>Use this reference instead of the image url for a responsive image.</span
						>
						<div class="flex w-fit flex-row items-center rounded-sm border">
							<CopyToClipboard text={ref} class="px-3" variant="ghost">
								<span class="pr-1 text-sm font-semibold">Image Ref</span>{ref}
							</CopyToClipboard>
						</div>

						<div class="flex flex-row items-center gap-4">
							<Button
								variant="destructive"
								size="sm"
								onclick={() => {
									selectedImageId = image.url ?? '';
									deleteImageModal = true;
								}}
							>
								<Trash_2 size={16} /> Delete
							</Button>

							{#if !ref}
								<form
									method="post"
									action="?/reuploadImage"
									use:enhance={() => {
										loading = true;
										return async ({ result }) => {
											await applyAction(result);
											loading = false;
										};
									}}
								>
									<input type="hidden" name="style" value={style.id} />
									<input type="hidden" name="imageUrl" value={image.url} />
									<input type="hidden" name="title" value={image.title ?? ''} />
									<input type="hidden" name="description" value={image.description ?? ''} />
									<Button variant="outline" size="sm" type="submit" disabled={loading}>
										<RefreshCw size={16} /> Reupload
									</Button>
								</form>
							{/if}

							<CopyToClipboard text={image.url} class="px-3" variant="outline">Copy URL</CopyToClipboard>
						</div>
						{#if image.description}
							<p>{image.description}</p>
						{/if}
					</div>
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
			<h2 class="text-xl">Author</h2>
		</div>

		{#if style.author}
			<div class="flex flex-row items-center gap-3 rounded-md border p-3">
				{#if style.author.avatar}
					<img src={style.author.avatar} alt="{style.author.name}'s avatar" class="h-10 w-10 rounded-full" />
				{/if}
				<div class="flex flex-col">
					<p class="font-semibold">{style.author.name}</p>
					<p class="text-muted-foreground text-sm">{style.author.id}</p>
				</div>
			</div>
		{:else}
			<p class="text-muted-foreground">No author assigned to this style.</p>
		{/if}

		<form method="post" action="?/reassignStyle" class="flex max-w-md flex-col gap-3" use:enhance>
			<input type="hidden" name="style" value={style.id} />
			<div class="flex flex-col items-start gap-2">
				<Label>New Author Discord ID</Label>
				<Input name="accountId" bind:value={reassignAccountId} placeholder="Discord ID" required />
			</div>
			<Button type="submit" class="w-fit" disabled={loading || !reassignAccountId}>
				<UserPlus size={16} /> Reassign Style
			</Button>
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
