<script lang="ts">
	import TooltipSimple from '$ui/tooltip/tooltip-simple.svelte';
	import FileText from '@lucide/svelte/icons/file-text';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import type { FortuneSourceProgress } from 'farming-weight';
	interface Props {
		progress: FortuneSourceProgress;
	}

	let { progress }: Props = $props();
</script>

{#if progress.active?.reason || progress.active?.active === false}
	<div class="flex flex-row items-center gap-1">
		<TooltipSimple side="left">
			{#snippet trigger()}
				{#if !progress.active?.active}
					<OctagonAlert size={16} class="text-completed" />
				{:else}
					<FileText size={16} class="text-muted-foreground" />
				{/if}
			{/snippet}
			<p class="max-w-32 text-sm">{progress.active?.reason || 'Current disabled due to your settings.'}</p>
		</TooltipSimple>
	</div>
{/if}
