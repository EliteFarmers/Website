<script lang="ts">
	import { Button } from '$ui/button';
	import Link from '@lucide/svelte/icons/link';

	interface Props {
		id: string;
		size?: number;
		self?: boolean;
		class?: string;
	}

	let { id, size = 20, self = true, class: className = '' }: Props = $props();
</script>

<Button
	href="#{id}"
	variant="ghost"
	size="sm"
	class="text-muted-foreground mx-2 scroll-mt-32 {className}"
	id={self ? id : undefined}
>
	<Link {size} />
</Button>
