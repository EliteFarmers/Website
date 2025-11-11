<script lang="ts">
	import Skeleton from '$ui/skeleton/skeleton.svelte';
</script>

<article class="mb-6 flex w-sm! flex-col gap-2">
	<Skeleton class="aspect-video rounded-md object-cover p-1 pb-0 opacity-85" />
	<div class="text-muted-foreground flex w-sm flex-row items-center justify-between gap-2 p-1">
		<div class="flex flex-1 flex-row items-center gap-1">
			<Skeleton class="size-6 rounded-full object-cover" />
			<Skeleton class="h-4 w-1/3" />
		</div>
		<Skeleton class="h-4 w-1/3" />
	</div>
	<Skeleton class="h-8 w-3/4" />
	<Skeleton class="h-4 w-full" />
	<Skeleton class="h-4 w-1/2" />
</article>
