<script lang="ts" module>
	import Check from 'lucide-svelte/icons/check';
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as ModeWatcher from 'mode-watcher';
	import { cn } from '$lib/utils';
	import { themes } from '$lib/themes';
	
	let currentMode = $state<string | undefined>(undefined);
	let currentTheme = $derived(themes.find(t => t.class === currentMode));

	ModeWatcher.mode.subscribe((value) => currentMode = value);

	export function clearThemes() {
		const themeClasses = themes.map(t => t.class);
		document.documentElement.classList.remove(...themeClasses);
		document.documentElement.className = '';
		
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const systemTheme = prefersDark ? 'dark' : 'light';
		
		document.documentElement.className = systemTheme;
		currentMode = systemTheme;
	}
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
		<Sun class="mx-2 block {currentTheme?.isDark ? 'hidden' : ''}" />
		<Moon class="mx-2 {currentTheme?.isDark ? '' : 'hidden'}" />
		<span class="sr-only">Toggle theme</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item
			onclick={() => {
				document.documentElement.className = 'light';
				currentMode = 'light';
			}}
		>
			<span class="capitalize">Default Light</span>
			{#if currentMode === 'light'}
				<Check class="ml-2 h-4 w-4" />
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item
			onclick={() => {
				document.documentElement.className = 'dark';
				currentMode = 'dark';
			}}
		>
			<span class="capitalize">Default Dark</span>
			{#if currentMode === 'dark'}
				<Check class="ml-2 h-4 w-4" />
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={clearThemes}>
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
