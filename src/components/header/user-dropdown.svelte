<script lang="ts">
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Avatar from '$ui/avatar';
	import { Button } from '$ui/button';
	import { page } from '$app/stores';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import UserRound from 'lucide-svelte/icons/user-round';

	$: user = $page.data.session;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
			<Avatar.Root class="h-8 w-8 items-center justify-center">
				{#if user}
					<UserIcon {user} size={8} />
				{:else}
					<UserRound class="h-6 w-6" />
				{/if}
			</Avatar.Root>
		</Button>
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
				<DropdownMenu.Item href="/profile">Profile</DropdownMenu.Item>
				<DropdownMenu.Item href="/@{user.ign}" disabled={!user.ign}>My Stats</DropdownMenu.Item>
				<DropdownMenu.Item href="/@{user.ign}/rates" disabled={!user.ign}>My Rates</DropdownMenu.Item>
				{#if user.flags.moderator}
					<DropdownMenu.Item href="/admin">Admin</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="/logout">Log out</DropdownMenu.Item>
		{:else}
			<DropdownMenu.Item href="/login">Login with Discord</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
