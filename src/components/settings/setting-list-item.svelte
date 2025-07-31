<script lang="ts">
	import Info from '@lucide/svelte/icons/info';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		subtitle?: Snippet;
		wiki?: string;
		children?: Snippet;
		child?: Snippet;
	}

	let { title, description = undefined, wiki, children, subtitle, child }: Props = $props();
</script>

<div
	class="setting-list-item flex w-full flex-col items-start justify-between gap-2 px-1 py-3 sm:flex-row sm:items-center"
>
	<div class="flex w-full flex-1 flex-col justify-center">
		<p class="md:text-lg">
			{title}
			{#if wiki}
				<a href={wiki} target="_blank" rel="noopener noreferrer" class="text-link inline-block">
					<Info class="size-4 pt-0.5" />
				</a>
			{/if}
		</p>
		{#if subtitle}
			<p class="mb-1">
				{@render subtitle?.()}
			</p>
		{/if}
		{#if description}
			<p class="text-muted-foreground mb-1 text-sm">
				{description}
			</p>
		{/if}
	</div>
	{#if child}
		{@render child?.()}
	{:else}
		<div class="flex w-fit flex-row items-center justify-end">
			{@render children?.()}
		</div>
	{/if}
</div>
