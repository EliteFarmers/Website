<script lang="ts">
	import type { Snippet } from 'svelte';
	let { label, value, children }: { label: string; value?: string; children?: Snippet } = $props();
</script>

<div class="min-w-0 space-y-1">
	<dt class="text-sm text-muted-foreground">{label}</dt>
	<dd class="text-lg font-medium tabular-nums">
		{#if children}{@render children()}{:else}{value}{/if}
	</dd>
</div>
