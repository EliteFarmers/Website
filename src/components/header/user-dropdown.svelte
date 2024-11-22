<script lang="ts">
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Avatar from '$ui/avatar';
	import { buttonVariants } from '$ui/button';
	import { page } from '$app/stores';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import UserRound from 'lucide-svelte/icons/user-round';
	import { cn } from '$lib/utils';

	let user = $derived($page.data.session);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({
				variant: 'ghost',
				class: 'px-1 text-base focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
			})
		)}
	>
		<Avatar.Root class="aspect-square size-8 items-center justify-center">
			{#if user}
				<UserIcon {user} class="aspect-square size-8" />
			{:else}
				<UserRound class="size-8" />
			{/if}
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end">
		{#if user}
			<DropdownMenu.Label class="font-normal">
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">{user.ign ?? user.username}</p>
					<p class="text-xs leading-none text-muted-foreground">{user.username}</p>
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.LinkItem href="/profile">Profile</DropdownMenu.LinkItem>
				<DropdownMenu.LinkItem href="/@{user.ign}" disabled={!user.ign}>My Stats</DropdownMenu.LinkItem>
				<DropdownMenu.LinkItem href="/@{user.ign}/rates" disabled={!user.ign}>My Rates</DropdownMenu.LinkItem>
				{#if user.flags.moderator}
					<DropdownMenu.LinkItem href="/admin">Admin</DropdownMenu.LinkItem>
				{/if}
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.LinkItem href="/logout">Log out</DropdownMenu.LinkItem>
		{:else}
			<DropdownMenu.LinkItem href="/login">Login with Discord</DropdownMenu.LinkItem>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
