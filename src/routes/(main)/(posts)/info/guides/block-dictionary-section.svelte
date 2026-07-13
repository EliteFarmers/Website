<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		children,
	}: {
		title: string;
		description: string;
		children: Snippet;
	} = $props();
</script>

<section class="space-y-4">
	<div class="max-w-3xl space-y-1">
		<h2 class="text-xl font-semibold tracking-normal">{title}</h2>
		<p class="text-muted-foreground text-sm leading-6">{description}</p>
	</div>

	<div class="grid gap-3 md:grid-cols-2">
		{@render children()}
	</div>
</section>
