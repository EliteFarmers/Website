<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';

	export let name: string | undefined = undefined;
	export let lore: string[];

	const formatted = name
		? [name, '', ...lore].map((l) => FormatMinecraftText(l))
		: lore.map((l) => FormatMinecraftText(l));
</script>

<div class="p-2 font-mono rounded-sm font-bold line-t">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<p>' + formatted.join('</p><p>') + '</p>'}
</div>
