<script lang="ts">
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';
	import FileText from '@lucide/svelte/icons/file-text';

	interface Props {
		member: components['schemas']['EventMemberDto'] | components['schemas']['AdminEventMemberDto'];
	}

	let { member }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2">
	<img src="https://mc-heads.net/avatar/{member.playerUuid}" class="aspect-square w-6 rounded-sm" alt="Player Head" />
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
				<FileText size={16} class="-mb-1 text-destructive" />
			{/snippet}
			<div class="text-sm">
				<p>{member.notes || 'Member Left'}</p>
			</div>
		</Popover.Mobile>
	{/if}
</div>
