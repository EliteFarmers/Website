<script lang="ts">
	import type { components } from '$lib/api/api';
	import { formatIgn } from '$lib/format';
	import * as Popover from '$ui/popover';
	import FileText from '@lucide/svelte/icons/file-text';

	interface Props {
		member: components['schemas']['EventMemberDto'] | components['schemas']['AdminEventMemberDto'];
		children?: import('svelte').Snippet;
	}

	let { member, children }: Props = $props();
</script>

<div class="flex w-full flex-row justify-between gap-1">
	<div class="flex flex-row items-center gap-2">
		{@render children?.()}
		<img
			src="https://mc-heads.net/avatar/{member.playerUuid}"
			class="aspect-square w-8 rounded-sm"
			alt="Player Head"
		/>
		<a
			href="/@{member.playerUuid}/{member.profileId ?? ''}"
			target="_blank"
			class="flex flex-row items-center gap-1 underline sm:text-lg"
		>
			{formatIgn(member.playerName, member.meta)}
		</a>
	</div>
	<div class="xs:gap-4 flex flex-row items-center gap-2">
		{#if 'notes' in member}
			<Popover.Mobile>
				{#snippet trigger()}
					<FileText size={20} class="text-destructive -mb-1" />
				{/snippet}
				<div>
					<p>{member.notes || 'Member Left'}</p>
				</div>
			</Popover.Mobile>
		{/if}
		<p class="text-xl font-semibold">{(+(member.score ?? 0)).toLocaleString()}</p>
	</div>
</div>
