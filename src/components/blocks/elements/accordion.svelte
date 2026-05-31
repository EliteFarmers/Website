<script lang="ts">
	import type { AccordionBlockNode } from '$comp/blocks/blocks';
	import * as Accordion from '$ui/accordion';
	import BlockRenderer from '../block-renderer.svelte';

	interface Props {
		node: AccordionBlockNode;
		hoistedComments?: Record<string, import('$lib/guides/types').CommentWithGuideAuthor[]>;
	}

	let { node, hoistedComments = {} }: Props = $props();
</script>

<Accordion.Root type="single" class="my-4 w-full">
	<Accordion.Item value="item-1">
		<Accordion.Trigger>{node.title}</Accordion.Trigger>
		<Accordion.Content>
			<BlockRenderer content={node.children} {hoistedComments} />
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
