<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import Plus from 'lucide-svelte/icons/plus';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { Button } from '$ui/button';
	import type { AdminEventMember, AdminEventTeam } from './columns';
	import Crown from 'lucide-svelte/icons/crown';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import { cn } from '$lib/utils';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

	interface Props {
		member: AdminEventMember;
		team?: AdminEventTeam;
		actions: Record<string, (member: AdminEventMember) => void>;
	}

	let { member, team, actions }: Props = $props();
	let isOwner = $derived(member.accountId === team?.ownerId);
</script>

<div class="flex flex-row items-center gap-2">
	{#if !team}
		<span class="text-muted-foreground">None!</span>
		<Button variant="ghost" size="icon" onclick={() => actions['addtoteam'](member)} class="relative size-8 p-0">
			<span class="sr-only">Add to team</span>
			<Plus />
		</Button>
	{:else}
		<span class="truncate">{team.name}</span>
		{#if isOwner}
			<Crown size={16} class="w-4 text-completed" />
		{/if}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
						<span class="sr-only">Open menu</span>
						<Ellipsis />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<DropdownMenu.GroupHeading>Join Code</DropdownMenu.GroupHeading>
					<DropdownMenu.Item>
						{#snippet child({ props })}
							<CopyToClipboard
								size="sm"
								class={cn(props.class ?? '', 'w-full cursor-pointer justify-start px-2 py-0 font-mono')}
								text={team.joinCode ?? ''}
								iconClass="p-0 m-0">{team.joinCode}</CopyToClipboard
							>
						{/snippet}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.GroupHeading>Manage</DropdownMenu.GroupHeading>
					<!-- <DropdownMenu.Item
						onclick={() => actions['editteam'](member)}
						class="cursor-pointer"
					>
						<Settings size={16} />
						Edit Team
					</DropdownMenu.Item> -->
					<DropdownMenu.Item
						onclick={() => actions['promote'](member)}
						class="cursor-pointer"
						disabled={isOwner}
					>
						<Crown size={16} class="text-completed" />
						Set as Owner
					</DropdownMenu.Item>
					{#if !isOwner}
						<DropdownMenu.Item
							onclick={() => actions['teamkick'](member)}
							class="cursor-pointer"
							disabled={isOwner}
						>
							<Trash_2 size={16} class="text-destructive" />
							Kick from team
						</DropdownMenu.Item>
					{/if}
					{#if team.members.length <= 1}
						<DropdownMenu.Item onclick={() => actions['deleteteam'](member)} class="cursor-pointer">
							<Trash_2 size={16} class="text-destructive" />
							Delete Team
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
</div>
