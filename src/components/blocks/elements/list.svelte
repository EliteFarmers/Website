<script lang="ts">
	import type { ListProps } from '../blocks.js';
	import List from './list.svelte';

	import HoistedCommentCallout from '$comp/comments/hoisted-comment-callout.svelte';
	import Ol from '$comp/markdown/default/ol.svelte';
	import Ul from '$comp/markdown/default/ul.svelte';
	import Li from './li.svelte';

	const { node, modifiers, hoistedComments = {}, renderTextAsHtml = false }: ListProps = $props();

	function getHoistedComments(child: (typeof node.children)[number]) {
		return child.id ? (hoistedComments[child.id] ?? []) : [];
	}
</script>

{#if node.format === 'ordered'}
	<Ol>
		{#each node.children as child, i (child.id ?? `list-item-${i}`)}
			{#if 'format' in child}
				{@const comments = getHoistedComments(child)}
				<li class="list-none">
					<List node={child} {modifiers} index={i} {hoistedComments} {renderTextAsHtml} />
					{#if comments.length}
						<div class="not-prose">
							{#each comments as comment (comment.id)}
								<HoistedCommentCallout {comment} />
							{/each}
						</div>
					{/if}
				</li>
			{:else}
				<Li node={child} {modifiers} index={i} {hoistedComments} {renderTextAsHtml} />
			{/if}
		{/each}
	</Ol>
{:else}
	<Ul>
		{#each node.children as child, i (child.id ?? `list-item-${i}`)}
			{#if 'format' in child}
				{@const comments = getHoistedComments(child)}
				<li class="list-none">
					<List node={child} {modifiers} index={i} {hoistedComments} {renderTextAsHtml} />
					{#if comments.length}
						<div class="not-prose">
							{#each comments as comment (comment.id)}
								<HoistedCommentCallout {comment} />
							{/each}
						</div>
					{/if}
				</li>
			{:else}
				<Li node={child} {modifiers} index={i} {hoistedComments} {renderTextAsHtml} />
			{/if}
		{/each}
	</Ul>
{/if}
