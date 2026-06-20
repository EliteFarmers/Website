<script lang="ts">
	import NumberFlow from '@number-flow/svelte';

	interface Props {
		viewerCount?: number | null;
		label?: string;
	}

	let { viewerCount = 0, label = 'viewers' }: Props = $props();
</script>

<div
	class="bg-background/85 inline-flex w-fit items-center gap-2 rounded-md border px-2.5 py-1 text-sm font-semibold shadow-sm backdrop-blur"
>
	<span class="relative flex size-2.5">
		<span class="bg-destructive absolute inline-flex size-full animate-ping rounded-full opacity-70"></span>
		<span class="bg-destructive relative inline-flex size-2.5 rounded-full"></span>
	</span>
	<NumberFlow value={viewerCount ?? 0} />
	<span class="text-muted-foreground font-medium">{label}</span>
</div>
