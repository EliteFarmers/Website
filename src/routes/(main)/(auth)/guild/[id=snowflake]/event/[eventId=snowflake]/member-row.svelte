<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { AdminEventMemberDto, EventMemberDto } from '$lib/api';
	import * as Popover from '$ui/popover';
	import FileText from '@lucide/svelte/icons/file-text';

	interface Props {
		member: EventMemberDto | AdminEventMemberDto;
	}

	let { member }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2">
	<PlayerHead uuid={member.playerUuid} size="lg" />
	<a
		href="/@{member.playerUuid}/{member.profileId ?? ''}"
		target="_blank"
		class="flex flex-row items-center gap-1 underline"
	>
		{member.playerName}
	</a>
	{#if member.notes}
		<Popover.Mobile>
			{#snippet trigger()}
				<FileText size={16} class="text-destructive -mb-1" />
			{/snippet}
			<div class="text-sm">
				<p>{member.notes || 'Member Left'}</p>
			</div>
		</Popover.Mobile>
	{/if}
</div>
