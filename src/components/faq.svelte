<script lang="ts">
	import * as Accordion from '$ui/accordion';
	import type { Snippet } from 'svelte';

	let {
		title = 'Frequently asked questions',
		items,
		id,
		children,
	}: {
		title?: string;
		items: readonly { question: string; answer: string }[];
		id?: string;
		children?: Snippet;
	} = $props();
</script>

<section {id} class="mt-8 w-full md:mt-12">
	<h2 class="mb-2 text-lg">{title}</h2>
	<Accordion.Root type="multiple">
		{#each items as item (item.question)}
			<Accordion.Item value={item.question}>
				<Accordion.Trigger>{item.question}</Accordion.Trigger>
				<Accordion.Content>{item.answer}</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
	{@render children?.()}
</section>
