<script lang="ts">
	import { INFO_CATEGORIES } from './info-pages';
</script>

<div class="flex w-full flex-col items-center justify-center md:flex-row md:flex-wrap">
	{#each INFO_CATEGORIES as category, i (i)}
		<a
			href="/info/{category.slug}"
			class="border-border bg-card m-4 flex h-24 w-full flex-row items-center justify-center gap-4 rounded-lg border p-4 text-center hover:scale-102 hover:shadow-lg active:scale-95 md:h-48 md:w-48 md:flex-col"
		>
			<category.icon class="text-primary m-2 h-8 w-8 md:mt-4 md:mb-2 md:flex-1" />
			<span class="flex-1 text-lg font-semibold">{category.title}</span>
		</a>
	{/each}
</div>
