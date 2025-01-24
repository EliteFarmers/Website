<script lang="ts">
	import * as Command from '$ui/command';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const styles = $derived(data.styles.sort((a, b) => (a.name ?? 'x').localeCompare(b?.name ?? 'x')));
</script>

<div class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Weight Styles</h1>

		<Command.Root>
			<Command.Input placeholder="Filter..." class="h-9" />
			<Command.Empty>No styles found.</Command.Empty>
			<Command.Group itemsClass="flex flex-wrap gap-3">
				{#each styles as style (style.id)}
					<Command.Item value={style.name ?? ''} class="p-0">
						<a
							href="/admin/style/{style.id}"
							class="flex h-full w-full flex-col items-center justify-between gap-2 rounded-md bg-primary-foreground p-2 md:flex-row"
						>
							<p>{style.name}</p>
						</a>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</section>
</div>
