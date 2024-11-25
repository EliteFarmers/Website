<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Textarea } from '$ui/textarea';
	import * as Dialog from '$ui/dialog';
	import { enhance } from '$app/forms';

	import type { PageData, ActionData } from './$types';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import { isValidWeightStyle, weightStyleParse } from '$lib/styles/style';
	import { untrack } from 'svelte';
	import Switch from '$comp/ui/switch/switch.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let style = $derived(data.style);
	let loading = $state(false);
	let deleteStyleModal = $state(false);

	let styleData = $state(JSON.stringify(data.style.data ?? '{}', undefined, 2) + '');
	let badge = $state(data.badges?.[0]?.image?.url ?? undefined);
	let rank = $state(1000);
	let showBadge = $state(false);
	let badgeUrl = $derived(showBadge ? badge : undefined);

	let styleDataValid = $derived.by(() => {
		try {
			const s = JSON.parse(styleData);
			return weightStyleParse(s);
		} catch {
			return undefined;
		}
	});

	let styleDataObj = $derived({
		...untrack(() => data.style),
		data: JSON.parse(styleData)
	});
</script>

<Head title="Product" description="Manage product" />

<main class="my-16">
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-8 flex flex-row items-center gap-4">
			<h1 class="text-4xl">{style.name}</h1>
		</div>

		{#if style.description}
			<p>{style.description}</p>
		{/if}

		{#if form?.error}
			<p class="text-red-500">{form.error}</p>
		{/if}
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Update Settings</h2>
		</div>
		<form method="post" action="?/updateStyle" class="flex flex-1 flex-col gap-4" use:enhance>
			<input type="hidden" name="style" value={style.id} />

			<div class="flex flex-col items-start gap-2 max-w-64">
				<Label>Style Name</Label>
				<Input name="name" value={style.name} required/>
			</div>

			<div class="flex flex-col items-start gap-2 max-w-2xl">
				<Label>Style Description</Label>
				<Textarea name="description" value={style.description} maxlength={1024} required/>
			</div>

			<Button class="max-w-32" type="submit" disabled={loading}>Update</Button>
		</form>
	</section>
	<section class="my-8 flex w-full max-w-4xl flex-col gap-4">
		<div class="mb-2 flex flex-row items-center gap-4">
			<h2 class="text-xl">Update Style Design</h2>
		</div>

		<div class="max-w-2xl h-36 max-h-36 pr-2 overflow-y-auto">
			{#if !styleDataValid?.success || !styleDataObj}
				<p class="text-red-500 mb-2">Invalid style data.</p>
				{#if styleDataValid?.error?.issues}
					<div class="flex flex-col gap-1">
						{#each styleDataValid.error.issues as issue}
							<div class="flex flex-col gap-1 p-2 border-2 border-primary-foreground rounded-sm">
								<p>{issue.path.join('.')}</p>
								<p>{issue.message}</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground">Data is invalid JSON, please make sure all properties are double quoted and check for missing commas.</p>
				{/if}
			{:else if styleDataObj}
				<div class="max-h-36">
					{#key badgeUrl}
						<WeightStyle style={styleDataObj} ign={data.user.username ?? 'Steve'} uuid={data.user.username ?? 'Steve'} {rank} {badgeUrl} />
					{/key}
				</div>
			{/if}
		</div>

		<div class="flex w-full md:flex-row gap-4 lg:flex-row">
			<form method="post" action="?/updateStyle" class="flex flex-1 flex-col gap-4" use:enhance>
				<input type="hidden" name="style" value={style.id} />

				<div class="flex flex-col items-start gap-2 max-w-2xl">
					<Textarea spellcheck={false} writingsuggestions={false} class="h-96 font-mono" name="description" wrap="soft" bind:value={styleData} />
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
			<h2 class="text-xl">Options</h2>
		</div>

		<div class="flex flex-row gap-2">
			<form method="post" action="?/duplicate" use:enhance>
				<input type="hidden" name="style" value={style.id} />
				<Button
					size="sm"
					type="submit"
					class="max-w-32"
				>
					Duplicate Style
				</Button>
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
</main>

<Dialog.Root bind:open={deleteStyleModal}>
	<Dialog.Content class="max-h-[80%] overflow-scroll">
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
