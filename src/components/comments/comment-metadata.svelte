<script lang="ts">
	import UserIcon from '$comp/discord/user-icon.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { CommentDto } from '$lib/api';
	import * as Tooltip from '$ui/tooltip';
	import { formatDistanceToNow } from 'date-fns';

	interface Props {
		comment: CommentDto;
	}

	let { comment }: Props = $props();

	let { author, createdAt, isEdited = false, isPending = false } = $derived(comment);
	let { id: authorId, name: authorName, avatar: authorAvatar } = $derived(author);

	let date = $derived(new Date(createdAt));
	let timeAgo = $derived(formatDistanceToNow(date, { addSuffix: true }));
	let ign = $derived.by(() => {
		const split = authorName.split(' ');
		return split.length === 1 ? split[0] : split.sort((a, b) => b.length - a.length)[0];
	});
</script>

<div class="flex scroll-mt-20 flex-row items-center gap-2" id="comment-{comment.sqid}">
	{#if authorName !== '[deleted]'}
		{#if authorAvatar}
			<UserIcon user={{ id: authorId, avatar: authorAvatar }} class="size-5 rounded-full" />
		{:else}
			<PlayerHead uuid={ign} class="size-5" />
		{/if}
		<a class="text-sm font-medium hover:underline" href="/@{authorId}">{authorName}</a>
	{:else}
		<p class="text-sm font-medium">{authorName}</p>
	{/if}

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
