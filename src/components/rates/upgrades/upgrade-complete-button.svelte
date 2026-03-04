<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import Check from '@lucide/svelte/icons/check';
	import type { FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
	}

	let { upgrade, applyUpgrade }: Props = $props();
</script>

<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => applyUpgrade?.(upgrade)}>
	<Check class="h-4 w-4" />
</Button>
