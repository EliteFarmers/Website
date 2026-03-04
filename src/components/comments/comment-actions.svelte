<script lang="ts">
	import type { CommentDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { approveCommentCommand } from '$lib/remote/admin-guides.remote';
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	interface Props {
		comment: CommentDto;
		onEdit?: () => void;
		onDelete?: () => void;
	}

	let { comment, onEdit, onDelete }: Props = $props();

	const gbl = getGlobalContext();

	let isOwner = $derived(gbl.session?.id === comment.author.id);
	let isModerator = $derived(gbl.session?.perms.moderator);
</script>

<div class="flex flex-row items-center gap-1">
	{#if isOwner || isModerator}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="sm"
						class="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
					>
						<EllipsisVertical size={16} />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content align="end">
				<DropdownMenu.Item onSelect={onEdit} class="flex flex-row items-center gap-2">
					<Pencil size={14} />
					<span>Edit</span>
				</DropdownMenu.Item>

				<DropdownMenu.Item variant="destructive" onSelect={onDelete} class="flex flex-row items-center gap-2">
					<Trash2 size={14} />
					<span>Delete</span>
				</DropdownMenu.Item>

				{#if isModerator}
					{#if comment.isPending}
						<DropdownMenu.Item
							onSelect={async () => {
								await approveCommentCommand(comment.id);
							}}
							class="flex flex-row items-center gap-2"
						>
							<MessageSquare size={14} />
							<span>Approve Comment</span>
						</DropdownMenu.Item>
					{/if}
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
</div>
