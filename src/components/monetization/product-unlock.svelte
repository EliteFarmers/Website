<script lang="ts">
	import * as Accordion from '$ui/accordion';
	import * as Card from '$ui/card';

	interface Props {
		open?: boolean;
		header?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { open = false, header, children }: Props = $props();
</script>

<Card.Root class="p-0">
	<Card.Content class="p-2">
		<Accordion.Root type="single" class="w-full" value={open ? '1' : undefined}>
			<Accordion.Item value="1" class="border-none p-0">
				<Accordion.Trigger class="border-none p-2">
					<div class="bg-card flex flex-row items-center gap-2 rounded-sm">
						{@render header?.()}
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="px-2 pt-1 pb-2">
					{@render children?.()}
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</Card.Content>
</Card.Root>
