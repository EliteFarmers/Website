<script lang="ts">
	import { Button } from 'bits-ui';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function closeToast() {
		dispatch('closeToast');
	}
</script>

{#snippet link(href: string, text: string)}
	<Button.Root {href} target="_blank" class="text-blue-500 no-underline hover:underline">
		{text}
	</Button.Root>
{/snippet}

<div class="w-full select-none space-y-4 rounded-md border border-muted p-5 text-foreground">
	<h3 class="whitespace-nowrap text-2xl font-bold">
		You qualify for <span class="text-link">Elite!</span>
	</h3>
	<p>
		Join the {@render link('https://discord.gg/farms', 'Discord')} and make a ticket to claim your rewards for being
		an Elite Farmer
	</p>
	<Button.Root
		class="w-full rounded-md bg-muted py-2 transition-opacity duration-200 hover:opacity-70"
		onclick={closeToast}>Close</Button.Root
	>
</div>
