<script lang="ts">
	import { cn } from '$lib/utils';
	import Info from '@lucide/svelte/icons/info';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		subtitle?: Snippet;
		wiki?: string;
		children?: Snippet;
		child?: Snippet;
		icon?: Snippet;
		class?: string;
	}

	let { title, description = undefined, wiki, children, subtitle, child, icon, class: className }: Props = $props();
</script>

<div
	class={cn(
		'setting-list-item flex w-full flex-col items-start justify-between gap-2 px-1 py-3 sm:flex-row sm:items-center',
		className
	)}
>
	<div class="flex w-full flex-1 flex-col justify-center">
		<div class="flex flex-row items-center gap-1 md:text-lg">
			{@render icon?.()}
			<p>{title}</p>
			{#if wiki}
				<a href={wiki} target="_blank" rel="noopener noreferrer" class="text-link inline-block">
					<Info class="size-4 pt-0.5" />
				</a>
			{/if}
		</div>
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
