<script lang="ts">
	import Card from '@smui/card';
	import Button from '@smui/button';

	export let name: string;
	export let price: number;
	export let href: string | undefined = undefined;
</script>

<Card class="p-4 flex-1">
	<h2 class="text-2xl">{name}</h2>
	<hr class="my-2" />
	<div class="flex flex-col justify-between h-full">
		<ul class="my-4 flex flex-col gap-2">
			<slot />
		</ul>
		{#if price === 0}
			<Button variant="raised" color="secondary" disabled>Unlocked</Button>
		{:else}
			<Button variant="raised" color="secondary" target="_blank" {href}>{price} USD</Button>
		{/if}
	</div>
</Card>
