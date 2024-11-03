<script lang="ts">
	import * as Card from '$ui/card';
	import * as Accordion from '$ui/accordion';

	export let open = false;
</script>

<Card.Root>
	<Card.Content class="flex flex-col items-start justify-center p-1 relative">
		<Accordion.Root class="w-full" value={open ? '1' : undefined}>
			<Accordion.Item value="1" class="border-none p-0">
				<Accordion.Trigger class="border-none p-2">
					<div class="flex flex-row gap-2 items-center rounded-sm bg-card">
						<slot name="header" />
					</div>
				</Accordion.Trigger>
				<Accordion.Content wrapperClass="pb-2 pt-1 px-2">
					<slot />
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</Card.Content>
</Card.Root>
