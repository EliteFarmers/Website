<script lang="ts">
	import Skeleton from '$ui/skeleton/skeleton.svelte';
</script>

<div class="bg-card flex h-52 w-64! flex-col rounded-lg border p-3 transition-shadow hover:shadow-lg">
	<div class="dark bg-muted flex w-full min-w-58 flex-row items-center gap-2 rounded-md p-2">
		<Skeleton class="bg-card aspect-square size-10" />
		<Skeleton class="bg-card h-6 w-full" />
	</div>
	<div class="p-1">
		<Skeleton class="mb-2 h-3 w-3/4" />
		<Skeleton class="h-5 w-1/2" />
	</div>

	<div class="flex h-full flex-1 flex-col justify-end">
		<div class="flex flex-row items-center gap-1 p-1">
			<Skeleton class="size-5" />
			<Skeleton class="h-3 w-3/4" />
		</div>
		<div class="flex flex-row items-center gap-1 p-1">
			<Skeleton class="size-5" />
			<Skeleton class="h-3 w-3/4" />
		</div>
	</div>
</div>
