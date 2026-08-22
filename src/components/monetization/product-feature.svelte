<script lang="ts">
	import { PopoverMobile } from '$ui/popover';

	interface Props {
		name?: string | undefined;
		icon?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { name = undefined, icon, children }: Props = $props();
</script>

<PopoverMobile>
	{#snippet trigger()}
		<div class="flex flex-row items-center gap-1 rounded-sm bg-card p-2">
			{@render icon?.()}
			{#if name}
				<p class="text-semibold text-sm leading-none">{name}</p>
			{/if}
		</div>
	{/snippet}
	<div>
		{@render children?.()}
	</div>
</PopoverMobile>
