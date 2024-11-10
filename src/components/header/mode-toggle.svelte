<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import { Button, buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { resetMode, setMode, mode } from 'mode-watcher';
	import { cn } from '$lib/utils';

	const modes = ['light', 'dark'] as const;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({
				variant: "ghost",
				class: "mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
			})
		)}
	>
		<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-roate-90 dark:scale-0" />
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#each modes as option}
			<DropdownMenu.Item onclick={() => setMode(option)}>
				<span class="capitalize">{option}</span>
				{#if $mode === option}
					<Check class="w-4 h-4 ml-2" />
				{/if}
			</DropdownMenu.Item>
		{/each}
		<DropdownMenu.Item onclick={() => resetMode()}>
			<span class="text-destructive">Use System Theme</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
