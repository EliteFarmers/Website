<script lang="ts" module>
	import Search from '@lucide/svelte/icons/search';
</script>

<script lang="ts">
	import SearchMenu from '$comp/header/search-menu.svelte';
	import { cn } from '$lib/utils';
	import { Button } from '$ui/button';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let open = $state(false);
</script>

<Button
	onclick={() => (open = true)}
	class={cn('flex flex-row gap-2 rounded-lg border-[3px] bg-card p-4', className)}
	variant="outline"
	size="lg"
>
	<Search class="-ml-0.5" />
	<span class="flex-1 text-muted-foreground">Search For Player...</span>
</Button>
<SearchMenu bind:open useButton={false} />
