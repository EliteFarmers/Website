<script lang="ts">
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { Button } from '$ui/button';

	export let href: string;
</script>

<Button variant="link" {href} class="decoration-blue-500">
	<div class="flex flex-row items-center gap-1 text-blue-500">
		<span>
			<slot />
		</span>
		<ExternalLink size={16} />
	</div>
</Button>
