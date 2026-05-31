<script lang="ts">
	import { Button } from '$ui/button';
	import type { Snippet } from 'svelte';

	let {
		name,
		description,
		children,
	}: {
		name: string;
		description: string;
		children: Snippet;
	} = $props();
</script>

<article class="bg-card rounded-lg border p-4">
	<div class="flex items-start gap-3">
		<Button
			variant="ghost"
			size="icon"
			class="bg-muted/40 pointer-events-none shrink-0 border"
			tabindex={-1}
			aria-label={name}
			title={name}
		>
			{@render children()}
		</Button>

		<div class="min-w-0 space-y-1">
			<h3 class="text-sm leading-5 font-semibold">{name}</h3>
			<p class="text-muted-foreground text-sm leading-6">{description}</p>
		</div>
	</div>
</article>
