<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Weight Styles</h1>

		<div class="flex w-full flex-wrap gap-4">
			{#each data.styles as style (style.id)}
				<a
					href="/admin/style/{style.id}"
					class="flex flex-col items-center justify-between gap-2 rounded-md bg-primary-foreground p-2 md:flex-row"
				>
					<p>{style.name}</p>
				</a>
			{/each}
		</div>
	</section>
</main>
