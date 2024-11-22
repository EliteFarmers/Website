<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';

	interface Props {
		name?: string | undefined;
		lore: string[];
	}

	let { name = undefined, lore }: Props = $props();

	let formatted = $derived(
		name && lore.length > 1
			? [name, '', ...lore].map((l) => FormatMinecraftText(l))
			: lore.map((l) => FormatMinecraftText(l))
	);
</script>

<div class="rounded-sm font-mono font-bold">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<p>' + formatted.join('</p><p>') + '</p>'}
</div>
