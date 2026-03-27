<script lang="ts">
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import Gift from '@lucide/svelte/icons/gift';

	const gbl = getGlobalContext();

	let open = $state(false);
	let dismissed = $state(false);

	$effect(() => {
		if (gbl.hasPendingGifts && !dismissed) {
			open = true;
		}
	});

	function onOpenChange(value: boolean) {
		open = value;
		if (!value) {
			dismissed = true;
		}
	}

	const giftCount = $derived(gbl.pendingGifts.length);

	const itemCount = $derived(gbl.pendingGifts.reduce((sum, g) => sum + g.items.length, 0));

	const earliestExpiry = $derived.by(() => {
		const expiries = gbl.pendingGifts
			.flatMap((g) => [g.claimExpiresAt, ...g.items.map((i) => i.gift?.claimExpiresAt)])
			.filter(Boolean) as string[];

		if (expiries.length === 0) return null;
		return expiries.reduce((earliest, current) => (current < earliest ? current : earliest));
	});

	const expiryText = $derived.by(() => {
		if (!earliestExpiry) return null;
		const expiry = new Date(earliestExpiry);
		const now = new Date();
		if (expiry <= now) return 'soon!';

		const diff = expiry.getTime() - now.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		if (days > 0) return `in ${days}d ${hours}h`;
		if (hours > 0) return `in ${hours}h`;
		return 'soon!';
	});
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Gift class="size-5" />
				{giftCount === 1 ? 'You have a gift!' : `You have ${giftCount} gifts!`}
			</Dialog.Title>
			<Dialog.Description>
				Someone sent you {itemCount === 1 ? 'an item' : `${itemCount} items`} on the Elite store. Head to your profile
				to view and claim {itemCount === 1 ? 'it' : 'them'}.
				{#if expiryText}
					<span class="text-destructive/80 mt-1 block">Your gift goes back to the sender {expiryText}.</span>
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => onOpenChange(false)}>Later</Button>
			<Button href="/profile/gifts" onclick={() => onOpenChange(false)}>
				<Gift class="size-4" />
				View Gifts
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
