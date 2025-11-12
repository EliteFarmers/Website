<script lang="ts">
	import type { ModifierProps } from '../blocks';

	let { children }: ModifierProps = $props();
</script>

<em class="italic">
	{@render children?.()}
</em>
