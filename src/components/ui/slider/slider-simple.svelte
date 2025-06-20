<script lang="ts">
	import { Slider as SliderPrimitive, type SliderSingleRootProps } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let { value = $bindable(0), class: className, ...restProps }: Omit<SliderSingleRootProps, 'type'> = $props();
</script>

<SliderPrimitive.Root
	bind:value
	class={cn('relative ml-2.5 flex w-full touch-none items-center select-none', className)}
	{...restProps}
	type="single"
>
	{#snippet children({ thumbs })}
		<span class="border-muted-variant bg-background relative h-2 w-full grow overflow-hidden rounded-full border">
			<SliderPrimitive.Range class="bg-primary absolute h-full" />
		</span>
		{#each thumbs as thumb, i (i)}
			<SliderPrimitive.Thumb
				index={thumb}
				class="border-primary bg-background ring-offset-background focus-visible:ring-ring block size-5 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
