<script lang="ts">
	import ContentReportDialog from '$comp/reports/content-report-dialog.svelte';
	import type { CommentDto } from '$lib/api';
	import type { CommentWithGuideAuthor } from '$lib/guides/types';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { approveCommentCommand } from '$lib/remote/admin-guides.remote';
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Flag from '@lucide/svelte/icons/flag';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import HoistCommentDialog, { type HoistTarget } from './hoist-comment-dialog.svelte';

	interface Props {
		comment: CommentDto;
		onEdit?: () => void;
		onDelete?: () => void;
		canHoist?: boolean;
		hoistTargets?: HoistTarget[];
		onHoist?: (targetId: string) => void;
		onClearHoist?: () => void;
	}

	let { comment, onEdit, onDelete, canHoist = false, hoistTargets = [], onHoist, onClearHoist }: Props = $props();

	const gbl = getGlobalContext();

	let isOwner = $derived(gbl.session?.id === comment.author.id);
	let isModerator = $derived(gbl.session?.perms.moderator);
	let canReport = $derived(Boolean(gbl.authorized && !comment.isDeleted));
	let hasMenu = $derived(isOwner || isModerator || canReport || canHoist);
	let showReportDialog = $state(false);
	let showHoistDialog = $state(false);
	let typedComment = $derived(comment as CommentWithGuideAuthor);
</script>

<div class="flex flex-row items-center gap-2">
	{#if comment.liftedElementId}
		<a href="#{comment.liftedElementId}">
			<Pin class="size-4 rotate-45 fill-current" />
		</a>
	{/if}
	{#if hasMenu}
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
				{#if isOwner || isModerator}
					<DropdownMenu.Item onSelect={onEdit} class="flex flex-row items-center gap-2">
						<Pencil size={14} />
						<span>Edit</span>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						variant="destructive"
						onSelect={onDelete}
						class="flex flex-row items-center gap-2"
					>
						<Trash2 size={14} />
						<span>Delete</span>
					</DropdownMenu.Item>
				{/if}

				{#if canHoist && hoistTargets.length}
					<DropdownMenu.Item
						onSelect={() => (showHoistDialog = true)}
						class="flex flex-row items-center gap-2"
					>
						<Pin size={14} />
						<span>Hoist correction</span>
					</DropdownMenu.Item>
				{/if}

				{#if canHoist && typedComment.liftedElementId}
					<DropdownMenu.Item onSelect={onClearHoist} class="flex flex-row items-center gap-2">
						<PinOff size={14} />
						<span>Clear hoist</span>
					</DropdownMenu.Item>
				{/if}

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

				{#if canReport}
					<DropdownMenu.Item
						onSelect={() => (showReportDialog = true)}
						class="flex flex-row items-center gap-2"
					>
						<Flag size={14} />
						<span>Report</span>
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
</div>

<ContentReportDialog
	open={showReportDialog}
	targetType="comment"
	targetId={comment.id}
	onOpenChange={(open) => (showReportDialog = open)}
/>

<HoistCommentDialog
	open={showHoistDialog}
	targets={hoistTargets}
	initialTarget={typedComment.liftedElementId}
	onOpenChange={(open) => (showHoistDialog = open)}
	onSubmit={(targetId) => onHoist?.(targetId)}
/>
