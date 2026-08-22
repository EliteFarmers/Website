<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Slider as SliderPrimitive, type SliderSingleRootProps } from 'bits-ui';

	let { value = $bindable(0), class: className, ...restProps }: Omit<SliderSingleRootProps, 'type'> = $props();
</script>

<SliderPrimitive.Root
	bind:value
	class={cn('relative ml-2.5 flex w-full touch-none items-center select-none', className)}
	{...restProps}
	type="single"
>
	{#snippet children({ thumbs })}
		<span class="border-muted-variant relative h-2 w-full grow overflow-hidden rounded-full border bg-background">
			<SliderPrimitive.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbs as thumb, i (i)}
			<SliderPrimitive.Thumb
				index={thumb}
				class="block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
