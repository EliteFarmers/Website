<script lang="ts">
	import { goto } from '$app/navigation';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import { cn } from '$lib/utils';
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Trash_2 from '@lucide/svelte/icons/trash-2';
	import Undo_2 from '@lucide/svelte/icons/undo-2';
	import type { AdminEventMember } from './columns';

	let { member, actions }: { member: AdminEventMember; actions: Record<string, (member: AdminEventMember) => void> } =
		$props();
</script>

<div class="mx-auto w-fit">
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
				<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
				{#if member.status === 3 || member.status === 2}
					<DropdownMenu.Item onclick={() => actions['unban'](member)} class="cursor-pointer">
						<Undo_2 size={16} />
						{member.status === 3 ? 'Unban' : 'Restore'} User
					</DropdownMenu.Item>
				{:else}
					<DropdownMenu.Item onclick={() => actions['ban'](member)} class="text-destructive cursor-pointer">
						<Trash_2 size={16} />
						Ban User
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => goto(`/@${member.playerUuid}/${member.profileId}`)}
				>View stats</DropdownMenu.Item
			>
			<DropdownMenu.Item>
				{#snippet child({ props })}
					<CopyToClipboard
						size="sm"
						class={cn(props.class ?? '', 'w-full cursor-pointer justify-start px-2 py-0')}
						text={member.playerUuid ?? ''}
						iconClass="m-0 p-0">Copy Player Uuid</CopyToClipboard
					>
				{/snippet}
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				{#snippet child({ props })}
					<CopyToClipboard
						size="sm"
						class={cn(props.class ?? '', 'w-full cursor-pointer justify-start px-2 py-0')}
						text={member.profileId ?? ''}
						iconClass="m-0 p-0">Copy Profile Uuid</CopyToClipboard
					>
				{/snippet}
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				{#snippet child({ props })}
					<CopyToClipboard
						size="sm"
						class={cn(props.class ?? '', 'w-full cursor-pointer justify-start px-2 py-0')}
						text={member.accountId?.toString() ?? ''}
						iconClass="m-0 p-0">Copy Discord Id</CopyToClipboard
					>
				{/snippet}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
