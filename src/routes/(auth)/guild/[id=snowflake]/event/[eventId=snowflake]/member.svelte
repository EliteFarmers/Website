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

<div class="flex w-full flex-row justify-between gap-1 text-black dark:text-white">
	<div class="flex flex-row items-center gap-2">
		{@render children?.()}
		<img
			src="https://mc-heads.net/avatar/{member.playerUuid}"
			class="aspect-square w-8 rounded-sm"
			alt="Player Head"
		/>
		<a href="/@{member.playerUuid}" target="_blank" class="flex flex-row items-center gap-1 underline sm:text-lg">
			{member.playerName}
		</a>
	</div>
	<div class="xs:gap-4 flex flex-row items-center gap-2">
		{#if 'notes' in member}
			<Popover.Mobile>
				{#snippet trigger()}
					<FileText size={20} class="-mb-1 text-destructive" />
				{/snippet}
				<div>
					<p>{member.notes || 'Member Left'}</p>
				</div>
			</Popover.Mobile>
		{/if}
		<p class="text-xl font-semibold">{(+(member.score ?? 0)).toLocaleString()}</p>
	</div>
</div>
