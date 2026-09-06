<script lang="ts">
	import { resolve } from '$app/paths';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import { TOOL_PAGES } from '$lib/tools/pages';
	import * as Card from '$ui/card';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
</script>

<ToolPage title="Farming Tools" description="Calculators, trackers, and global stats for your Garden." overview>
	<div class="grid gap-4 md:grid-cols-2">
		{#each TOOL_PAGES as tool (tool.href)}
			<a
				href={resolve(tool.href)}
				class="group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Card.Root
					class="h-full flex-row items-center gap-4 rounded-md border-2 p-5 shadow-none transition-colors group-hover:bg-muted"
				>
					<tool.icon class="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
					<div class="min-w-0 flex-1 space-y-1">
						<h2 class="text-lg font-medium">{tool.title}</h2>
						<p class="text-sm text-muted-foreground">{tool.description}</p>
					</div>
					<ArrowRight class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				</Card.Root>
			</a>
		{/each}
	</div>
</ToolPage>
