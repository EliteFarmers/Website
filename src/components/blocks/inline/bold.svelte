<script lang="ts">
	import type { ModifierProps } from '../blocks';

	let { children }: ModifierProps = $props();
</script>

<strong class="font-semibold">
	{@render children?.()}
</strong>
