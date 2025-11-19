<script lang="ts">
	import type { ModifierProps } from '../blocks';

	let { children }: ModifierProps = $props();
</script>

<span class="underline">
	{@render children?.()}
</span>
