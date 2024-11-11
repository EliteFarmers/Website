<script lang="ts">
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';
	import FileText from 'lucide-svelte/icons/file-text';

	interface Props {
		member: components['schemas']['EventMemberDto'] | components['schemas']['EventMemberBannedDto'];
		children?: import('svelte').Snippet;
	}

	let { member, children }: Props = $props();
</script>

<div class="flex justify-between flex-row gap-1 w-full text-black dark:text-white">
	<div class="flex flex-row gap-2 items-center">
		{@render children?.()}
		<img
			src="https://mc-heads.net/avatar/{member.playerUuid}"
			class="w-8 aspect-square rounded-sm"
			alt="Player Head"
		/>
		<a href="/@{member.playerUuid}" target="_blank" class="sm:text-lg underline flex flex-row items-center gap-1">
			{member.playerName}
		</a>
	</div>
	<div class="flex flex-row gap-2 xs:gap-4 items-center">
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
		<p class="font-semibold text-xl">{(+(member.score ?? 0)).toLocaleString()}</p>
	</div>
</div>
