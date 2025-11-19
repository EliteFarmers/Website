<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import NitroAdSlot from './nitro-ad-slot.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		slotId: string;
		config: Record<string, unknown>;
	}

	let { ...rest }: Props = $props();
</script>

<NitroAdSlot {...rest} />
