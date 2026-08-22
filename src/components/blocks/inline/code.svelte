<script lang="ts">
	import type { ModifierProps } from '../blocks';

	let { children }: ModifierProps = $props();
</script>

<span class="-my-0.5 rounded bg-muted px-1 py-0.5 font-mono">
	{@render children?.()}
</span>
