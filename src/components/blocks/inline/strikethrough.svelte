<script lang="ts">
	import type { ModifierProps } from '../blocks';

	let { children }: ModifierProps = $props();
</script>

<span class="line-through">
	{@render children?.()}
</span>
