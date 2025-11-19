<script lang="ts">
	import type { ListProps } from '../blocks.js';
	import List from './list.svelte';

	import Ol from '$comp/markdown/default/ol.svelte';
	import Ul from '$comp/markdown/default/ul.svelte';
	import Li from './li.svelte';

	const { node, modifiers }: ListProps = $props();
</script>

{#if node.format === 'ordered'}
	<Ol>
		{#each node.children as child, i (`list-item-${i}`)}
			{#if 'format' in child}
				<List node={child} {modifiers} index={i} />
			{:else}
				<Li node={child} {modifiers} index={i} />
			{/if}
		{/each}
	</Ol>
{:else}
	<Ul>
		{#each node.children as child, i (`list-item-${i}`)}
			{#if 'format' in child}
				<List node={child} {modifiers} index={i} />
			{:else}
				<Li node={child} {modifiers} index={i} />
			{/if}
		{/each}
	</Ul>
{/if}
