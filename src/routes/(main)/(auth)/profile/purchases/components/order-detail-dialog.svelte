<script lang="ts">
	import PlayerSearch from '$comp/player-search.svelte';
	import type { UserOrderDto } from '$lib/api';
	import { GetUserOrder } from '$lib/remote/payments.remote';
	import { ResendGift } from '$lib/remote/gifts.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Separator } from '$ui/separator';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Gift from '@lucide/svelte/icons/gift';
	import Loader from '@lucide/svelte/icons/loader';
	import Package from '@lucide/svelte/icons/package';
	import Search from '@lucide/svelte/icons/search';
	import {
		formatOrderCurrency,
		formatOrderDateTime,
		getOrderDisplayId,
		getOrderProviderLabel,
		getOrderResolutionText,
		getOrderStatusVariant,
		humanizeOrderLabel,
	} from '../payments';
	import { toast } from 'svelte-sonner';

	interface Props {
		orderId: string | null;
		onClose: () => void;
	}

	let { orderId, onClose }: Props = $props();

	let open = $derived(!!orderId);
	let order = $state<UserOrderDto | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let activeLoadRequest = 0;
	let reassignItemId = $state<string | null>(null);
	let reassignRecipient = $state('');
	let reassigning = $state(false);
	let playerSearchOpen = $state(false);
	let playerSearchValue = $state('');

	let reassignItem = $derived.by(() =>
		reassignItemId && order ? (order.items.find((item) => item.orderItemId === reassignItemId) ?? null) : null
	);

	async function loadOrderDetails(targetOrderId = orderId) {
		if (!targetOrderId) {
			order = null;
			error = null;
			return;
		}

		const requestId = ++activeLoadRequest;
		loading = true;
		error = null;

		try {
			const data = await GetUserOrder({ orderId: targetOrderId });

			if (requestId !== activeLoadRequest) {
				return;
			}

			order = data;
		} catch {
			if (requestId === activeLoadRequest) {
				error = 'Failed to load order details.';
			}
		} finally {
			if (requestId === activeLoadRequest) {
				loading = false;
			}
		}
	}

	$effect(() => {
		if (!orderId) {
			order = null;
			error = null;
			reassignItemId = null;
			return;
		}

		loadOrderDetails(orderId);
	});

	function onOpenChange(value: boolean) {
		if (!value) {
			onClose();
		}
	}

	function openReassignDialog(item: UserOrderDto['items'][number]) {
		reassignItemId = item.orderItemId;
		reassignRecipient = item.gift?.recipientSnapshot?.minecraftIgn ?? '';
		playerSearchValue = reassignRecipient;
	}

	function closeReassignDialog() {
		reassignItemId = null;
		reassignRecipient = '';
		playerSearchValue = '';
		playerSearchOpen = false;
	}

	async function submitReassign() {
		if (!orderId || !reassignItem || !reassignRecipient.trim()) {
			return;
		}

		if (!reassignItem.gift?.isReassignable) {
			toast.error('This gift item can no longer be reassigned.');
			return;
		}

		reassigning = true;

		try {
			const result = await ResendGift({
				orderId,
				orderItemIds: [reassignItem.orderItemId],
				mode: 'GiftUser',
				playerUuidOrIgn: reassignRecipient.trim(),
				guildId: null,
				message: null,
			});

			if (result.status === 'sent') {
				toast.success('Gift reassigned.');
				closeReassignDialog();
				await loadOrderDetails(orderId);
				return;
			}

			const fallback =
				result.status === 'conflict'
					? 'This gift can no longer be reassigned.'
					: result.status === 'forbidden'
						? 'You are not allowed to reassign this gift.'
						: 'Failed to reassign the gift.';
			toast.error(result.message ?? fallback);
		} finally {
			reassigning = false;
		}
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<Loader class="text-muted-foreground size-6 animate-spin" />
			</div>
		{:else if error}
			<Dialog.Header>
				<Dialog.Title>Order Details</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-col items-center gap-3 py-8">
				<p class="text-muted-foreground text-sm">{error}</p>
				<Button variant="outline" size="sm" onclick={() => loadOrderDetails(orderId)}>Retry</Button>
			</div>
		{:else if order}
			<Dialog.Header>
				<Dialog.Title>Order #{getOrderDisplayId(order.orderId)}</Dialog.Title>
				<Dialog.Description>
					<span class="font-mono text-xs break-all">{order.orderId}</span>
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-col gap-4">
				<!-- Status & Provider -->
				<div class="flex flex-wrap items-center gap-2">
					<Badge variant={getOrderStatusVariant(order.status)}>{humanizeOrderLabel(order.status)}</Badge>
					<Badge variant="secondary">{getOrderProviderLabel(order.provider)}</Badge>
					{#if order.isGiftSent}
						<Badge variant="outline" class="gap-1">
							<Gift class="size-3" />
							Gift Sent
						</Badge>
					{/if}
					{#if order.isGiftReceived}
						<Badge variant="outline" class="gap-1">
							<Gift class="size-3" />
							Gift Received
						</Badge>
					{/if}
					{#if order.recurringReference}
						<Badge variant="outline">Recurring</Badge>
					{/if}
				</div>

				<!-- Dates -->
				<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
					<p class="text-muted-foreground">Ordered</p>
					<p>{formatOrderDateTime(order.orderDate)}</p>

					{#if getOrderResolutionText(order)}
						<p class="text-muted-foreground">Resolution</p>
						<p>{getOrderResolutionText(order)}</p>
					{/if}

					{#if order.providerStatus}
						<p class="text-muted-foreground">Provider Status</p>
						<p>{humanizeOrderLabel(order.providerStatus)}</p>
					{/if}
				</div>

				<!-- Recipient Info -->
				{#if order.recipientSnapshot}
					{@const snap = order.recipientSnapshot}
					<div>
						<p class="text-muted-foreground mb-1 text-xs font-medium uppercase">Recipient</p>
						<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
							{#if snap.minecraftIgn}
								<p class="text-muted-foreground">Minecraft</p>
								<p>{snap.minecraftIgn}</p>
							{/if}
							{#if snap.mode}
								<p class="text-muted-foreground">Mode</p>
								<p>{humanizeOrderLabel(snap.mode)}</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Gift Message -->
				{#if order.giftMetadata?.message}
					<div>
						<p class="text-muted-foreground mb-1 text-xs font-medium uppercase">Gift Message</p>
						<p class="bg-muted/50 rounded-md px-3 py-2 text-sm italic">"{order.giftMetadata.message}"</p>
					</div>
				{/if}

				<Separator />

				<!-- Items -->
				<div>
					<p class="text-muted-foreground mb-2 text-xs font-medium uppercase">
						Items ({order.items.length})
					</p>
					<div class="flex flex-col gap-2">
						{#each order.items as item (item.orderItemId)}
							<div
								class={item.gift?.isReassignable
									? 'border-destructive/40 bg-destructive/5 rounded-md border px-3 py-2'
									: 'bg-muted/30 rounded-md px-3 py-2'}
							>
								<div class="flex items-start justify-between gap-2">
									<div class="flex items-start gap-2">
										{#if item.gift?.isReassignable}
											<AlertTriangle class="text-destructive mt-0.5 size-4 shrink-0" />
										{:else}
											<Package class="text-muted-foreground mt-0.5 size-4 shrink-0" />
										{/if}
										<div>
											<p class="text-sm font-medium">
												{item.productName ??
													item.tebexPackage?.name ??
													`Product #${item.productId}`}
												{#if item.quantity > 1}
													<span class="text-muted-foreground">&times;{item.quantity}</span>
												{/if}
											</p>
											{#if item.gift}
												{@const gift = item.gift}
												<div class="mt-1 flex flex-wrap gap-1">
													{#if gift.recipientResolutionStatus}
														<Badge variant="outline" class="text-[11px]">
															{humanizeOrderLabel(gift.recipientResolutionStatus)}
														</Badge>
													{/if}
													{#if gift.isReassignable}
														<Badge variant="secondary" class="text-[11px]"
															>Reassignable</Badge
														>
													{/if}
													{#if gift.claimExpiresAt}
														{@const expired = new Date(gift.claimExpiresAt) <= new Date()}
														<Badge
															variant={expired ? 'destructive' : 'secondary'}
															class="text-[11px]"
														>
															{expired
																? 'Expired'
																: `Expires ${formatOrderDateTime(gift.claimExpiresAt)}`}
														</Badge>
													{/if}
												</div>
												{#if gift.recipientSnapshot?.minecraftIgn}
													<p class="text-muted-foreground mt-1 text-xs">
														Recipient: {gift.recipientSnapshot.minecraftIgn}
													</p>
												{/if}
												{#if gift.isReassignable}
													<Button
														class="mt-2"
														variant="outline"
														size="sm"
														onclick={() => openReassignDialog(item)}
													>
														Reassign Gift
													</Button>
												{/if}
											{/if}
										</div>
									</div>
									<p class="text-sm font-medium whitespace-nowrap">
										{formatOrderCurrency(item.totalPrice, order.currency)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<Separator />

				<!-- Total -->
				<div class="flex items-center justify-between">
					<p class="font-medium">Total</p>
					<p class="text-lg font-semibold">{formatOrderCurrency(order.totalPrice, order.currency)}</p>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={!!reassignItem} onOpenChange={(value) => !value && closeReassignDialog()}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Reassign Gift</Dialog.Title>
			<Dialog.Description>
				Choose a new recipient for
				{reassignItem?.productName ??
					reassignItem?.tebexPackage?.name ??
					`Product #${reassignItem?.productId}`}. This only reassigns the selected item, not the whole order.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-4">
			<div class="rounded-md border p-3">
				<p class="text-muted-foreground text-xs font-medium uppercase">Recipient</p>
				{#if reassignRecipient}
					<p class="mt-1 text-sm font-medium">{reassignRecipient}</p>
				{:else}
					<p class="text-muted-foreground mt-1 text-sm">No recipient selected yet.</p>
				{/if}
			</div>

			<Button variant="outline" class="justify-start" onclick={() => (playerSearchOpen = true)}>
				<Search class="size-4" />
				{reassignRecipient ? 'Choose Another Player' : 'Choose Player'}
			</Button>
		</div>

		<Dialog.Footer class="mt-4">
			<Button variant="outline" onclick={closeReassignDialog} disabled={reassigning}>Cancel</Button>
			<Button onclick={submitReassign} disabled={reassigning || !reassignRecipient.trim()}>
				{#if reassigning}
					<Loader class="size-4 animate-spin" />
					Reassigning...
				{:else}
					Reassign
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<PlayerSearch
	useButton={false}
	bind:open={playerSearchOpen}
	bind:search={playerSearchValue}
	cmd={(player) => {
		reassignRecipient = player;
		playerSearchValue = player;
	}}
/>
