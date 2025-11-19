<script lang="ts">
	import type { ModifierProps } from '../blocks';

	let { children }: ModifierProps = $props();
</script>

<span class="bg-muted -my-0.5 rounded px-1 py-0.5 font-mono">
	{@render children?.()}
</span>
