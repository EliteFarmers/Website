<script lang="ts">
	import { Button } from '$ui/button';
	import Link from 'lucide-svelte/icons/link';

	export let id: string;
	export let size = 20;
	export let self = true;

	let className = '';
	export { className as class };
</script>

<Button
	href="#{id}"
	variant="ghost"
	size="sm"
	class="mx-2 scroll-mt-32 text-gray-500 hover:text-inherit {className}"
	id={self ? id : undefined}
>
	<Link {size} />
</Button>
