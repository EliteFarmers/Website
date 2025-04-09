<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import * as Command from '$ui/command';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let createStyleModal = $state(false);
	let loading = $state(false);

	const styles = $derived(data.styles.sort((a, b) => (a.name ?? 'x').localeCompare(b?.name ?? 'x')));
</script>

<div class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Weight Styles</h1>

		<Button
			onclick={() => {
				createStyleModal = true;
			}}
			class="mb-4 w-fit"
		>
			Create Style
		</Button>
		<Command.Root>
			<Command.Input placeholder="Filter..." class="h-9" />
			<Command.Empty>No styles found.</Command.Empty>
			<Command.Group itemsClass="flex flex-wrap gap-3">
				{#each styles as style (style.id)}
					<Command.Item value={style.name ?? ''} class="p-0">
						<a
							href="/admin/style/{style.id}"
							class="flex h-full w-full flex-col items-center justify-between gap-2 rounded-md bg-muted p-2 md:flex-row"
						>
							<p>{style.name}</p>
						</a>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</section>
</div>

<Dialog.Root bind:open={createStyleModal}>
	<Dialog.Content class="max-h-[80%] overflow-auto">
		<Dialog.Title>Delete Style</Dialog.Title>
		<form
			action="?/createStyle"
			method="post"
			class="flex flex-col gap-4"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result) createStyleModal = false;
					update();
				};
			}}
		>
			<p class="mb-2">Create a new Weight Style</p>
			<div class="flex flex-col items-start gap-2">
				<Label>Name</Label>
				<Input name="name" placeholder="Style Name" />
			</div>

			<div class="flex flex-col items-start gap-2">
				<Label>Description</Label>
				<Input name="description" placeholder="Style Description" />
			</div>

			<Button type="submit" class="mt-4 w-full" disabled={loading}>
				{loading ? 'Creating...' : 'Create'}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
