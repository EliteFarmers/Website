<script lang="ts">
	import Info from '@lucide/svelte/icons/info';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		wiki?: string;
		children?: Snippet;
		child?: Snippet;
	}

	let { title, description = undefined, wiki, children, child }: Props = $props();
</script>

<div class="setting-list-item flex w-full flex-row items-center justify-between gap-2 px-1 py-3">
	<div class="flex w-full flex-1 flex-col justify-center">
		<p class="md:text-lg">
			{title}
			{#if wiki}
				<a href={wiki} target="_blank" rel="noopener noreferrer" class="inline-block text-link">
					<Info class="size-4 pt-0.5" />
				</a>
			{/if}
		</p>
		{#if description}
			<p class="mb-1 hidden text-sm text-muted-foreground sm:block">{description}</p>
		{/if}
	</div>
	{#if child}
		{@render child?.()}
	{:else}
		<div class="flex w-full max-w-32 flex-row items-center justify-end">
			{@render children?.()}
		</div>
	{/if}
</div>
{#if description}
	<p class="-mt-1 mb-1 block px-1 pb-3 text-sm text-muted-foreground sm:hidden">{description}</p>
{/if}
