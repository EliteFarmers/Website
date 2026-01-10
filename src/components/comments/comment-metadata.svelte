<script lang="ts">
	import UserIcon from '$comp/discord/user-icon.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { CommentResponse } from '$lib/api';
	import * as Tooltip from '$ui/tooltip';
	import { formatDistanceToNow } from 'date-fns';

	interface Props {
		comment: CommentResponse;
	}

	let { comment }: Props = $props();

	let { authorName, authorId, authorAvatar, createdAt, isEdited = false, isPending = false } = $derived(comment);

	let date = $derived(new Date(createdAt));
	let timeAgo = $derived(formatDistanceToNow(date, { addSuffix: true }));
	let ign = $derived.by(() => {
		const split = authorName.split(' ');
		return split.length === 1 ? split[0] : split.sort((a, b) => b.length - a.length)[0];
	});
</script>

<div class="flex flex-row items-center gap-2">
	{#if authorName !== '[deleted]'}
		{#if authorAvatar}
			<UserIcon user={{ id: authorId, avatar: authorAvatar }} class="size-5 rounded-full" />
		{:else}
			<PlayerHead uuid={ign} class="size-5" />
		{/if}
	{/if}
	<p class="text-sm font-medium">{authorName}</p>

	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<p {...props} class="text-muted-foreground text-xs">{timeAgo}</p>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>{date.toLocaleString()}</Tooltip.Content>
	</Tooltip.Root>

	{#if !comment.isDeleted}
		{#if isEdited}
			<span class="text-muted-foreground text-xs">(edited{comment.isEditedByAdmin ? ' by admin' : ''})</span>
		{/if}

		{#if isPending}
			<span class="text-completed text-xs">(pending review)</span>
		{/if}
	{/if}
</div>
