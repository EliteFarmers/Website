<script lang="ts">
	import Editor from '$comp/editor/Editor.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import { getGuideEditContext } from '$lib/guides/edit-state.svelte';
	import { GetGuideAssets, ListTags } from '$lib/remote/guides.remote';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import { Input } from '$ui/input';
	import MultiSelect from '$ui/multi-select/multi-select.svelte';
	import { Textarea } from '$ui/textarea';

	const edit = getGuideEditContext();
	const guideId = edit.requireGuideId();
	const availableTagsPromise = $derived(ListTags());
	const guideAssetsPromise = $derived(GetGuideAssets(guideId));
	const availableTags = $derived(await availableTagsPromise);
	const guideAssets = $derived(await guideAssetsPromise);
	const tagOptions = $derived(
		availableTags.map((tag) => ({
			label: tag.name,
			value: tag.id.toString(),
		}))
	);
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Guide Details</CardTitle>
			<CardDescription>Basic information about your guide</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div>
				<label for="title" class="text-sm font-semibold">Title</label>
				<Input id="title" placeholder="Guide title" bind:value={edit.title} class="mt-1" />
			</div>

			<div>
				<label for="description" class="text-sm font-semibold">Description</label>
				<Textarea
					id="description"
					placeholder="Brief summary of your guide"
					bind:value={edit.description}
					rows={2}
					class="mt-1"
				/>
			</div>

			<div>
				<label for="skyblock-icon" class="text-sm font-semibold">Skyblock Icon ID (Optional)</label>
				<div class="flex flex-row items-center gap-1">
					<ItemRender skyblockId={edit.skyblockIconId || 'STONE'} class="size-8" />
					<Input
						id="skyblock-icon"
						placeholder="ex: WHEAT, SEEDS, DIAMOND_BLOCK, etc."
						bind:value={edit.skyblockIconId}
						oninput={(e) => (edit.skyblockIconId = e.currentTarget.value.toUpperCase())}
						class="mt-1"
					/>
				</div>

				<p class="text-muted-foreground mt-1 text-xs">The Skyblock item ID to display as the guide icon</p>
			</div>

			<div class="flex flex-col gap-1">
				<label for="tags" class="text-sm font-semibold">Tags</label>
				<MultiSelect options={tagOptions} bind:value={edit.tags} placeholder="Select tags..." class="mt-1" />
			</div>
		</CardContent>
	</Card>

	{#if edit.hasLoadedGuide}
		<Editor
			content={edit.markdownContent}
			onChange={(blocks) => (edit.editorContent = blocks)}
			class="min-h-125"
			guideId={edit.guideId}
			assets={guideAssets}
			onAssetsChanged={() => undefined}
		/>
	{:else}
		<div class="flex justify-center py-8">
			<Button variant="outline" disabled>Loading editor...</Button>
		</div>
	{/if}
</div>
