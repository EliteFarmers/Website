<script lang="ts">
	import { Button } from '$ui/button';
	import Link from 'lucide-svelte/icons/link';

	export let id: string;
	export let size = 20;
	export let self = true;
</script>

<Button
	href="#{id}"
	variant="ghost"
	size="sm"
	class="mx-2 scroll-mt-32 text-gray-500 hover:text-inherit"
	id={self ? id : undefined}
>
	<Link {size} />
</Button>
