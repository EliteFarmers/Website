<script lang="ts">
	import { goto } from '$app/navigation';
	import { createGuideCommand } from '$lib/remote/guides.remote';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import { Separator } from '$ui/separator';

	let selectedType = $state('0');
	let isLoading = $state(false);

	const guideTypes = [
		{ label: 'General', value: '0' },
		{ label: 'Farming', value: '1' },
		{ label: 'Greenhouse', value: '2' },
		{ label: 'Contest', value: '3' },
	];

	async function createGuide() {
		if (!selectedType) {
			return;
		}

		isLoading = true;

		try {
			const result = await createGuideCommand(selectedType);

			if (!result || result.error || !result.guide?.slug) {
				return;
			}

			await goto(`/guides/${result.guide.slug}/edit`);
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>Create a New Guide</CardTitle>
			<CardDescription>Choose a guide type to get started</CardDescription>
		</CardHeader>
		<Separator />
		<CardContent class="flex flex-col gap-6 pt-6">
			<div class="flex flex-col gap-2">
				<label for="type" class="text-sm font-semibold">Guide Type</label>
				<select
					id="type"
					bind:value={selectedType}
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					<option value="">Select a type</option>
					{#each guideTypes as type (type.value)}
						<option value={type.value}>{type.label}</option>
					{/each}
				</select>
				<p class="text-muted-foreground mt-1 text-xs">
					{#if selectedType === '0'}
						Create a general guide covering any topic
					{:else if selectedType === '1'}
						Share farming tips and strategies
					{:else if selectedType === '2'}
						Document greenhouse layouts and designs
					{:else if selectedType === '3'}
						Create contest guides and resources
					{:else}
						Select a type to see description
					{/if}
				</p>
			</div>

			<Button onclick={createGuide} disabled={isLoading || !selectedType} class="w-full">
				{#if isLoading}
					Creating...
				{:else}
					Create Guide
				{/if}
			</Button>

			<a href="/guides" class="text-center">
				<Button variant="ghost" class="w-full">Cancel</Button>
			</a>
		</CardContent>
	</Card>
</div>
