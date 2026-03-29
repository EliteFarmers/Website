<script lang="ts">
	import { page } from '$app/state';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { cn } from '$lib/utils';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import LogIn from '@lucide/svelte/icons/log-in';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import Settings from '@lucide/svelte/icons/settings';
	import UserRound from '@lucide/svelte/icons/user-round';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const globalContext = getGlobalContext();
	const session = $derived(globalContext.initialized ? globalContext.session : null);
</script>

{#if session}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<button
					{...props}
					class={cn(
						'border-border/60 bg-background/80 hover:bg-card inline-flex h-10 items-center gap-2 rounded-full border px-2 text-sm font-medium shadow-sm transition-colors',
						className
					)}
					aria-label="Open account menu"
				>
					<UserIcon user={session} class="size-7 rounded-full" />
					<span class="hidden max-w-28 truncate sm:inline">{session.ign || session.username}</span>
					<ChevronDown class="hidden size-4 text-current/70 sm:inline" />
				</button>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content align="end" class="min-w-56 rounded-2xl">
			<DropdownMenu.Label class="text-sm font-semibold">Account</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.LinkItem href="/profile/settings">
				<Settings />
				Profile Settings
			</DropdownMenu.LinkItem>
			<DropdownMenu.LinkItem href="/profile/purchases">
				<ReceiptText />
				Purchase History
			</DropdownMenu.LinkItem>
			<DropdownMenu.Separator />
			<DropdownMenu.LinkItem data-sveltekit-preload-data="off" href="/logout">
				<LogOut />
				Log out
			</DropdownMenu.LinkItem>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<a
		class={cn(
			'border-border/60 bg-background/80 hover:bg-card inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-sm transition-colors',
			className
		)}
		data-sveltekit-preload-data="off"
		href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search + page.url.hash)}"
	>
		<UserRound class="size-4" />
		<span class="hidden sm:inline">Login</span>
		<LogIn class="size-4 text-current/70" />
	</a>
{/if}
