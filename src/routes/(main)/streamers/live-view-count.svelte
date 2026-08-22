<script lang="ts">
	import NumberFlow from '@number-flow/svelte';

	interface Props {
		viewerCount?: number | null;
		label?: string;
	}

	let { viewerCount = 0, label = 'viewers' }: Props = $props();
</script>

<div
	class="inline-flex w-fit items-center gap-2 rounded-md border bg-background/85 px-2.5 py-1 text-sm font-semibold shadow-sm backdrop-blur"
>
	<span class="relative flex size-2.5">
		<span class="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-70"></span>
		<span class="relative inline-flex size-2.5 rounded-full bg-destructive"></span>
	</span>
	<NumberFlow value={viewerCount ?? 0} />
	<span class="font-medium text-muted-foreground">{label}</span>
</div>
