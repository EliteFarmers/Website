<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as ModeWatcher from 'mode-watcher';
	import { cn } from '$lib/utils';
	import { themes } from '$lib/themes';
	import { resetMode } from 'mode-watcher';
	let currentMode: string | undefined;

	ModeWatcher.mode.subscribe((value) => (currentMode = value));

	const menuThemes = themes.slice(0, 2);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({
				variant: 'ghost',
				class: 'px-1 py-0 text-base focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
			})
		)}
	>
		<Sun class="mx-2 block dark:hidden" />
		<Moon class="mx-2 hidden dark:block" />
		<span class="sr-only">Toggle theme</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#each menuThemes as theme}
			<DropdownMenu.Item
				onclick={() => {
					ModeWatcher.setMode(theme.class);
				}}
			>
				<span class="capitalize">{theme.name}</span>
				{#if theme.class === currentMode}
					<Check class="ml-2 h-4 w-4" />
				{/if}
			</DropdownMenu.Item>
		{/each}
		<DropdownMenu.Item onclick={() => resetMode()}>
			<span class="text-destructive">Use System Theme</span>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			<a href="/profile/settings#themes" class="flex w-full text-muted-foreground hover:text-foreground">
				See More Themes
			</a>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
