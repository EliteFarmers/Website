<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';

	export let name: string | undefined = undefined;
	export let lore: string[];

	$: formatted =
		name && lore.length > 1
			? [name, '', ...lore].map((l) => FormatMinecraftText(l))
			: lore.map((l) => FormatMinecraftText(l));
</script>

<div class="font-mono rounded-sm font-bold">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<p>' + formatted.join('</p><p>') + '</p>'}
</div>
