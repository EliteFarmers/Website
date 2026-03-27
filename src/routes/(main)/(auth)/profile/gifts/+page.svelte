<script lang="ts">
	import Head from '$comp/head.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { GiftItemDto, PendingGiftDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import { Checkbox } from '$ui/checkbox';
	import * as Dialog from '$ui/dialog';
	import Clock from '@lucide/svelte/icons/clock';
	import Gift from '@lucide/svelte/icons/gift';
	import Package from '@lucide/svelte/icons/package';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const gbl = getGlobalContext();

	let gifts = $derived(gbl.hasPendingGifts ? gbl.pendingGifts : data.pendingGifts);
	let declineDialogOpen = $state(false);
	let declineTargetGift = $derived(gifts.find((gift) => gift.orderId === declineTargetOrderId) ?? null);
	let declineTargetCount = $derived(
		declineTargetGift ? getSelectedCount(declineTargetGift.orderId) || declineTargetGift.items.length : 0
	);

	let claimingOrderId = $state<string | null>(null);
	let decliningOrderId = $state<string | null>(null);
	let declineTargetOrderId = $state<string | null>(null);
	let selectedItems = $state<Record<string, SvelteSet<string>>>({});

	function toggleItem(orderId: string, orderItemId: string) {
		const current = selectedItems[orderId] ?? new SvelteSet<string>();
		if (current.has(orderItemId)) {
			current.delete(orderItemId);
		} else {
			current.add(orderItemId);
		}
		selectedItems[orderId] = current;
	}

	function isItemSelected(orderId: string, orderItemId: string): boolean {
		return selectedItems[orderId]?.has(orderItemId) ?? false;
	}

	function getSelectedCount(orderId: string): number {
		return selectedItems[orderId]?.size ?? 0;
	}

	function selectAllItems(gift: PendingGiftDto) {
		selectedItems[gift.orderId] = new SvelteSet(gift.items.map((i) => i.orderItemId));
	}

	function deselectAllItems(orderId: string) {
		selectedItems[orderId] = new SvelteSet();
	}

	async function claimSelected(gift: PendingGiftDto) {
		claimingOrderId = gift.orderId;
		try {
			const selected = selectedItems[gift.orderId];
			const orderItemIds = selected && selected.size > 0 ? [...selected] : undefined;

			console.log('Claiming gift', gift.orderId, orderItemIds);
			const result = await gbl.claimGift(gift.orderId, orderItemIds);

			if (result.status === 'claimed') {
				toast.success('Gift claimed successfully!');
				delete selectedItems[gift.orderId];
			} else {
				const fallback =
					result.status === 'conflict'
						? 'Some items have expired or were already claimed.'
						: result.status === 'forbidden'
							? 'You are not the intended recipient for these items.'
							: 'Failed to claim gift. Please try again.';
				toast.error(result.message ?? fallback);
			}
		} finally {
			claimingOrderId = null;
		}
	}

	async function declineSelected(gift: PendingGiftDto) {
		decliningOrderId = gift.orderId;
		try {
			const selected = selectedItems[gift.orderId];
			const orderItemIds = selected && selected.size > 0 ? [...selected] : undefined;

			const result = await gbl.declineGift(gift.orderId, orderItemIds);

			if (result.status === 'declined') {
				toast.success('Gift declined.');
				delete selectedItems[gift.orderId];
				if (declineTargetOrderId === gift.orderId) {
					declineDialogOpen = false;
					declineTargetOrderId = null;
				}
			} else {
				const fallback =
					result.status === 'conflict'
						? 'Some items were already claimed or are no longer available to decline.'
						: result.status === 'forbidden'
							? 'You are not allowed to decline these items.'
							: 'Failed to decline gift. Please try again.';
				toast.error(result.message ?? fallback);
			}
		} finally {
			decliningOrderId = null;
		}
	}

	function openDeclineDialog(gift: PendingGiftDto) {
		declineTargetOrderId = gift.orderId;
		declineDialogOpen = true;
	}

	function closeDeclineDialog() {
		declineDialogOpen = false;
		declineTargetOrderId = null;
	}

	function formatExpiry(expiresAt: string | null | undefined): string | null {
		if (!expiresAt) return null;
		const expiry = new Date(expiresAt);
		const now = new Date();
		if (expiry <= now) return 'Expired';

		const diff = expiry.getTime() - now.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		if (days > 0) return `${days}d ${hours}h remaining`;
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		if (hours > 0) return `${hours}h ${minutes}m remaining`;
		return `${minutes}m remaining`;
	}

	function getItemExpiry(item: GiftItemDto): string | null | undefined {
		return item.gift?.claimExpiresAt;
	}

	function isItemExpired(item: GiftItemDto): boolean {
		const expiresAt = getItemExpiry(item);
		if (!expiresAt) return false;
		return new Date(expiresAt) <= new Date();
	}

	function getEarliestExpiry(gift: PendingGiftDto): string | null {
		const expiries = [gift.claimExpiresAt, ...gift.items.map((i) => getItemExpiry(i)).filter(Boolean)].filter(
			Boolean
		) as string[];

		if (expiries.length === 0) return null;
		return expiries.reduce((earliest, current) => (current < earliest ? current : earliest));
	}
</script>

<Head title="Gifts" description="View and claim gifts sent to you on the Elite store." />

<div class="my-16 flex w-full flex-col gap-6">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold">Gifts</h1>
		<p class="text-muted-foreground max-w-3xl">
			View and claim gifts that other players have sent you through the Elite store. You can claim individual
			items or all items at once.
		</p>
	</div>

	{#if gifts.length === 0}
		<Card.Root class="border-dashed">
			<Card.Content class="flex flex-col items-center justify-center gap-4 py-12">
				<Gift class="text-muted-foreground size-12" />
				<div class="text-center">
					<p class="text-lg font-medium">No pending gifts</p>
					<p class="text-muted-foreground text-sm">
						When someone sends you a gift, it will appear here for you to claim.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each gifts as gift (gift.orderId)}
				{@const claiming = claimingOrderId === gift.orderId}
				{@const declining = decliningOrderId === gift.orderId}
				{@const selectedCount = getSelectedCount(gift.orderId)}
				{@const allSelected = selectedCount === gift.items.length}
				{@const earliestExpiry = getEarliestExpiry(gift)}
				{@const expiryText = formatExpiry(earliestExpiry)}
				<Card.Root>
					<Card.Header>
						<div class="flex items-start justify-between">
							<Card.Title class="flex items-center gap-2 text-lg">
								<Gift class="size-5 text-green-500" />
								Gift
							</Card.Title>
							{#if expiryText}
								<Badge variant={expiryText === 'Expired' ? 'destructive' : 'secondary'} class="text-xs">
									<Clock class="mr-1 size-3" />
									{expiryText}
								</Badge>
							{/if}
						</div>
						{#if gift.giftMessage}
							<Card.Description class="italic">
								"{gift.giftMessage}"
							</Card.Description>
						{/if}
						{#if gift.buyerName}
							<p class="text-muted-foreground flex items-center gap-1.5 text-xs">
								<PlayerHead uuid={gift.buyerName} size="sm" />
								From: {gift.buyerName}
							</p>
						{/if}
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-2">
							{#each gift.items as item (item.orderItemId)}
								{@const itemExpiry = formatExpiry(getItemExpiry(item))}
								{@const expired = isItemExpired(item)}
								<label
									class="flex items-center gap-2 rounded-md p-1.5 text-sm transition-colors {expired
										? 'opacity-50'
										: 'hover:bg-accent/50 cursor-pointer'}"
								>
									<Checkbox
										checked={isItemSelected(gift.orderId, item.orderItemId)}
										onCheckedChange={() => toggleItem(gift.orderId, item.orderItemId)}
										disabled={expired || claiming || declining}
									/>
									<Package class="text-muted-foreground size-4 shrink-0" />
									<span class="flex-1">
										{item.productName ?? `Product #${item.productId}`}
										{#if item.quantity > 1}
											<span class="text-muted-foreground">&times;{item.quantity}</span>
										{/if}
									</span>
									{#if itemExpiry && itemExpiry !== expiryText}
										<span class="text-muted-foreground text-xs">{itemExpiry}</span>
									{/if}
								</label>
							{/each}
						</div>
						<div class="mt-3 flex items-center justify-between">
							{#if gift.orderDate}
								<p class="text-muted-foreground text-xs">
									Sent {new Date(gift.orderDate).toLocaleDateString()}
								</p>
							{/if}
							{#if gift.items.length > 1}
								<button
									class="text-muted-foreground hover:text-foreground text-xs underline"
									onclick={() =>
										allSelected ? deselectAllItems(gift.orderId) : selectAllItems(gift)}
									disabled={claiming || declining}
								>
									{allSelected ? 'Deselect all' : 'Select all'}
								</button>
							{/if}
						</div>
					</Card.Content>
					<Card.Footer class="flex-row gap-2">
						<Button
							class="min-w-0 flex-1"
							disabled={claiming || declining}
							onclick={() => claimSelected(gift)}
						>
							{#if claiming}
								Claiming...
							{:else if selectedCount > 0}
								Claim {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'}
							{:else}
								Claim All
							{/if}
						</Button>
						<Button
							class="shrink-0"
							variant="outline"
							size="icon"
							disabled={claiming || declining}
							onclick={() => openDeclineDialog(gift)}
							aria-label={selectedCount > 0
								? `Deny ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'}`
								: 'Deny this gift'}
						>
							<Trash2 class="text-destructive size-4" />
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<Dialog.Root bind:open={declineDialogOpen}>
	<Dialog.ScrollContent>
		<Dialog.Title>Deny Gift?</Dialog.Title>
		<Dialog.Description>
			{#if declineTargetGift}
				{#if declineTargetCount === declineTargetGift.items.length}
					Denying this gift will return it to the sender, and they will be able to choose a new recipient.
				{:else}
					Denying these {declineTargetCount} selected items will return them to the sender, and they will be able
					to choose a new recipient.
				{/if}
			{/if}
		</Dialog.Description>

		<Dialog.Footer class="mt-4">
			<Button
				variant="outline"
				onclick={closeDeclineDialog}
				disabled={Boolean(declineTargetGift && decliningOrderId === declineTargetGift.orderId)}
			>
				Back
			</Button>
			<Button
				variant="destructive"
				disabled={!declineTargetGift || decliningOrderId === declineTargetGift.orderId}
				onclick={() => declineTargetGift && declineSelected(declineTargetGift)}
			>
				{#if declineTargetGift && decliningOrderId === declineTargetGift.orderId}
					Denying...
				{:else}
					Deny
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.ScrollContent>
</Dialog.Root>
