<script lang="ts">
	import { page } from '$app/state';
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import Head from '$comp/head.svelte';
	import type {
		AdminOrderDetailDto,
		ProviderEventDto,
		ReconciliationResultDto,
		ReplayWebhookResponse,
	} from '$lib/api';
	import {
		CancelRecurringPayment,
		GetAdminOrderDetail,
		GetOrderEvents,
		PauseRecurringPayment,
		ReconcileOrder,
		RefreshProviderState,
		RefundOrder,
		ReplayWebhook,
		ResolveRecipient,
		ResumeRecurringPayment,
	} from '$lib/remote/admin.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Separator } from '$ui/separator';
	import * as Table from '$ui/table';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Package from '@lucide/svelte/icons/package';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const orderId = $derived(page.params.orderId ?? '');

	let order = $state<AdminOrderDetailDto | null>(null);
	let events = $state<ProviderEventDto[]>([]);
	let loading = $state(true);
	let eventsLoading = $state(false);
	let actionLoading = $state<string | null>(null);

	// Reconcile result
	let reconcileResult = $state<ReconciliationResultDto | null>(null);
	let reconcileDialogOpen = $state(false);

	// Resolve recipient
	let resolveDialogOpen = $state(false);
	let resolveRecipientType = $state('user');
	let resolveMinecraftUuid = $state('');
	let resolveGuildId = $state('');

	// Pause recurring
	let pauseDialogOpen = $state(false);
	let pauseUntil = $state('');

	// Refund confirmation
	let refundDialogOpen = $state(false);

	// Replay webhook
	let replayDialogOpen = $state(false);
	let replayWebhookId = $state('');
	let replayResult = $state<ReplayWebhookResponse | null>(null);

	// Event detail
	let selectedEvent = $state<ProviderEventDto | null>(null);

	onMount(() => {
		loadOrder();
	});

	async function loadOrder() {
		loading = true;
		try {
			order = await GetAdminOrderDetail({ orderId });
		} catch (e) {
			console.error('Failed to load order', e);
			toast.error('Failed to load order details.');
		} finally {
			loading = false;
		}
	}

	async function loadEvents() {
		eventsLoading = true;
		try {
			events = (await GetOrderEvents({ orderId })) ?? [];
		} catch (e) {
			console.error('Failed to load events', e);
			toast.error('Failed to load order events.');
		} finally {
			eventsLoading = false;
		}
	}

	async function doReconcile() {
		actionLoading = 'reconcile';
		try {
			reconcileResult = await ReconcileOrder({ orderId });
			reconcileDialogOpen = true;
			await loadOrder();
		} catch (e) {
			console.error('Reconcile failed', e);
			toast.error('Reconciliation failed.');
		} finally {
			actionLoading = null;
		}
	}

	async function doRefreshProvider() {
		actionLoading = 'refresh';
		try {
			order = await RefreshProviderState({ orderId });
			toast.success('Provider state refreshed.');
		} catch (e) {
			console.error('Refresh failed', e);
			toast.error('Failed to refresh provider state.');
		} finally {
			actionLoading = null;
		}
	}

	async function doRefund() {
		actionLoading = 'refund';
		try {
			order = await RefundOrder({ orderId });
			refundDialogOpen = false;
			toast.success('Order refunded.');
		} catch (e) {
			console.error('Refund failed', e);
			toast.error('Refund failed.');
		} finally {
			actionLoading = null;
		}
	}

	async function doResolveRecipient() {
		actionLoading = 'resolve';
		try {
			await ResolveRecipient({
				orderId,
				recipientType: resolveRecipientType,
				minecraftUuid: resolveRecipientType === 'user' ? resolveMinecraftUuid || undefined : undefined,
				guildId: resolveRecipientType === 'guild' ? resolveGuildId || undefined : undefined,
			});
			resolveDialogOpen = false;
			toast.success('Recipient resolved.');
			await loadOrder();
		} catch (e) {
			console.error('Resolve failed', e);
			toast.error('Failed to resolve recipient.');
		} finally {
			actionLoading = null;
		}
	}

	async function doPauseRecurring() {
		if (!pauseUntil) return;
		actionLoading = 'pause';
		try {
			order = await PauseRecurringPayment({ orderId, pausedUntil: new Date(pauseUntil).toISOString() });
			pauseDialogOpen = false;
			toast.success('Recurring payment paused.');
		} catch (e) {
			console.error('Pause failed', e);
			toast.error('Failed to pause recurring payment.');
		} finally {
			actionLoading = null;
		}
	}

	async function doResumeRecurring() {
		actionLoading = 'resume';
		try {
			order = await ResumeRecurringPayment({ orderId });
			toast.success('Recurring payment resumed.');
		} catch (e) {
			console.error('Resume failed', e);
			toast.error('Failed to resume recurring payment.');
		} finally {
			actionLoading = null;
		}
	}

	async function doCancelRecurring() {
		actionLoading = 'cancel';
		try {
			order = await CancelRecurringPayment({ orderId });
			toast.success('Recurring payment cancelled.');
		} catch (e) {
			console.error('Cancel failed', e);
			toast.error('Failed to cancel recurring payment.');
		} finally {
			actionLoading = null;
		}
	}

	async function doReplayWebhook() {
		if (!replayWebhookId.trim()) return;
		actionLoading = 'replay';
		try {
			replayResult = await ReplayWebhook({ webhookId: replayWebhookId.trim() });
		} catch (e) {
			console.error('Replay failed', e);
			toast.error('Failed to replay webhook.');
		} finally {
			actionLoading = null;
		}
	}

	function getDisplayId(id: string) {
		return id.length > 12 ? id.slice(-12).toUpperCase() : id.toUpperCase();
	}

	function getStatusVariant(status?: string | null): 'default' | 'destructive' | 'secondary' | 'outline' {
		const s = status?.trim().toLowerCase() ?? '';
		if (s.includes('refund') || s.includes('cancel') || s.includes('dispute') || s.includes('chargeback'))
			return 'destructive';
		if (s.includes('complete') || s.includes('paid') || s.includes('success')) return 'default';
		if (s.includes('pending') || s.includes('open') || s.includes('processing')) return 'secondary';
		return 'outline';
	}

	function humanize(value?: string | null) {
		if (!value) return 'Unknown';
		return value
			.replace(/[_-]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function formatCurrency(amount: number | null | undefined, currency: string) {
		if (amount == null) return '-';
		try {
			return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(
				amount
			);
		} catch {
			return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
		}
	}

	function formatDate(value?: string | null) {
		if (!value) return '-';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '-';
		return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
	}
</script>

<Head title="Order {getDisplayId(orderId)}" description="Admin order detail." />

<div class="container mx-auto py-10">
	<Button href="/admin/orders" variant="ghost" class="mb-4">
		<ArrowLeft class="mr-2 size-4" />
		Back to Orders
	</Button>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 class="text-muted-foreground size-8 animate-spin" />
		</div>
	{:else if !order}
		<Card.Root>
			<Card.Content class="flex flex-col items-center gap-4 py-12">
				<AlertTriangle class="text-muted-foreground size-10" />
				<p class="text-lg font-medium">Order not found</p>
				<Button href="/admin/orders" variant="outline">Return to orders</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="mb-6 flex flex-col gap-2">
			<h1 class="text-3xl font-bold">Order #{getDisplayId(order.orderId)}</h1>
			<p class="text-muted-foreground font-mono text-sm break-all">{order.orderId}</p>
		</div>

		<div class="grid gap-6 xl:grid-cols-3">
			<!-- Main detail column -->
			<div class="flex flex-col gap-6 xl:col-span-2">
				<!-- Status & Overview -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Order Overview</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="mb-4 flex flex-wrap gap-2">
							<Badge variant={getStatusVariant(order.status)}>{humanize(order.status)}</Badge>
							<Badge variant="secondary">{humanize(order.provider)}</Badge>
							{#if order.providerStatus}
								<Badge variant="outline">{humanize(order.providerStatus)}</Badge>
							{/if}
							{#if order.purchaseMode}
								<Badge variant="outline">{humanize(order.purchaseMode)}</Badge>
							{/if}
							{#if order.recurringReference}
								<Badge variant="outline">Recurring</Badge>
							{/if}
						</div>

						<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
							<div>
								<p class="text-muted-foreground text-xs">Total</p>
								<p class="font-semibold">{formatCurrency(order.totalPrice, order.currency)}</p>
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Ordered</p>
								<p>{formatDate(order.orderDate)}</p>
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Completed</p>
								<p>{formatDate(order.completedAt)}</p>
							</div>
							{#if order.refundedAt}
								<div>
									<p class="text-destructive text-xs">Refunded</p>
									<p class="text-destructive">{formatDate(order.refundedAt)}</p>
								</div>
							{/if}
							{#if order.disputedAt}
								<div>
									<p class="text-destructive text-xs">Disputed</p>
									<p class="text-destructive">{formatDate(order.disputedAt)}</p>
								</div>
							{/if}
						</div>

						<Separator class="my-4" />

						<!-- IDs -->
						<div class="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
							<div>
								<p class="text-muted-foreground text-xs">Buyer ID</p>
								<p class="font-mono text-xs">{order.buyerId}</p>
							</div>
							{#if order.recipientId}
								<div>
									<p class="text-muted-foreground text-xs">Recipient ID</p>
									<p class="font-mono text-xs">{order.recipientId}</p>
								</div>
							{/if}
							{#if order.recipientGuildId}
								<div>
									<p class="text-muted-foreground text-xs">Recipient Guild ID</p>
									<p class="font-mono text-xs">{order.recipientGuildId}</p>
								</div>
							{/if}
							{#if order.transactionId}
								<div>
									<p class="text-muted-foreground text-xs">Transaction ID</p>
									<p class="font-mono text-xs">{order.transactionId}</p>
								</div>
							{/if}
							{#if order.basketIdent}
								<div>
									<p class="text-muted-foreground text-xs">Basket Ident</p>
									<p class="font-mono text-xs">{order.basketIdent}</p>
								</div>
							{/if}
							{#if order.recurringReference}
								<div>
									<p class="text-muted-foreground text-xs">Recurring Reference</p>
									<p class="font-mono text-xs">{order.recurringReference}</p>
								</div>
							{/if}
							{#if order.recipientResolutionStatus}
								<div>
									<p class="text-muted-foreground text-xs">Recipient Resolution</p>
									<Badge variant="outline">{humanize(order.recipientResolutionStatus)}</Badge>
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Recipient Snapshot -->
				{#if order.recipientSnapshot}
					<Card.Root>
						<Card.Header>
							<Card.Title>Recipient Snapshot</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
								<div>
									<p class="text-muted-foreground text-xs">Type</p>
									<p>{String(order.recipientSnapshot.recipientType)}</p>
								</div>
								{#if order.recipientSnapshot.mode}
									<div>
										<p class="text-muted-foreground text-xs">Mode</p>
										<p>{humanize(order.recipientSnapshot.mode)}</p>
									</div>
								{/if}
								{#if order.recipientSnapshot.minecraftIgn}
									<div>
										<p class="text-muted-foreground text-xs">Minecraft IGN</p>
										<p>{order.recipientSnapshot.minecraftIgn}</p>
									</div>
								{/if}
								{#if order.recipientSnapshot.minecraftUuid}
									<div>
										<p class="text-muted-foreground text-xs">Minecraft UUID</p>
										<div class="flex max-w-fit items-center gap-2">
											<CopyToClipboard text={order.recipientSnapshot.minecraftUuid} size="sm" />
											<p class="truncate font-mono text-xs">
												{order.recipientSnapshot.minecraftUuid}
											</p>
										</div>
									</div>
								{/if}
								{#if order.recipientSnapshot.discordUserId}
									<div>
										<p class="text-muted-foreground text-xs">Discord User</p>
										<div class="flex max-w-fit items-center gap-2">
											<CopyToClipboard
												text={order.recipientSnapshot.discordUserId.toLocaleString()}
												size="sm"
											/>
											<p class="truncate font-mono text-xs">
												{order.recipientSnapshot.discordUserId}
											</p>
										</div>
									</div>
								{/if}
								{#if order.recipientSnapshot.guildId}
									<div>
										<p class="text-muted-foreground text-xs">Guild ID</p>
										<p class="font-mono text-xs">{order.recipientSnapshot.guildId}</p>
									</div>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Gift Metadata -->
				{#if order.giftMetadata}
					<Card.Root>
						<Card.Header>
							<Card.Title>Gift Info</Card.Title>
						</Card.Header>
						<Card.Content>
							{#if order.giftMetadata.message}
								<p class="bg-muted/50 mb-2 rounded-md px-3 py-2 text-sm italic">
									"{order.giftMetadata.message}"
								</p>
							{/if}
							{#if order.giftMetadata.claimExpiresAt}
								<p class="text-sm">
									Claim expires: <span class="font-medium"
										>{formatDate(order.giftMetadata.claimExpiresAt)}</span
									>
								</p>
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Items -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Items ({order.items.length})</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-3">
							{#each order.items as item (item.orderItemId)}
								<div class="bg-muted/30 rounded-md px-4 py-3">
									<div class="flex items-start justify-between gap-2">
										<div class="flex items-start gap-2">
											<Package class="text-muted-foreground mt-0.5 size-4 shrink-0" />
											<div>
												<p class="text-sm font-medium">
													{item.productName ?? `Product #${item.productId}`}
													{#if item.quantity > 1}
														<span class="text-muted-foreground">&times;{item.quantity}</span
														>
													{/if}
												</p>
												<p class="text-muted-foreground font-mono text-xs">
													Item: {item.orderItemId} &middot; Product: {item.productId}
												</p>
											</div>
										</div>
									</div>
									{#if item.gift}
										<div class="mt-2 flex flex-wrap gap-1.5">
											{#if item.gift.recipientType}
												<Badge variant="outline" class="text-[11px]">
													{humanize(item.gift.recipientType)}
												</Badge>
											{/if}
											{#if item.gift.recipientResolutionStatus}
												<Badge variant="outline" class="text-[11px]">
													{humanize(item.gift.recipientResolutionStatus)}
												</Badge>
											{/if}
											{#if item.gift.isReassignable}
												<Badge variant="secondary" class="text-[11px]">Reassignable</Badge>
											{/if}
											{#if item.gift.claimExpiresAt}
												{@const expired = new Date(item.gift.claimExpiresAt) <= new Date()}
												<Badge
													variant={expired ? 'destructive' : 'secondary'}
													class="text-[11px]"
												>
													{expired
														? 'Expired'
														: `Expires ${formatDate(item.gift.claimExpiresAt)}`}
												</Badge>
											{/if}
											{#if item.gift.recipientId}
												<span class="text-muted-foreground text-xs"
													>Recipient: {item.gift.recipientId}</span
												>
											{/if}
											{#if item.gift.recipientGuildId}
												<span class="text-muted-foreground text-xs"
													>Guild: {item.gift.recipientGuildId}</span
												>
											{/if}
										</div>
										{#if item.gift.recipientSnapshot}
											<div class="text-muted-foreground mt-1 text-xs">
												{#if item.gift.recipientSnapshot.minecraftIgn}
													MC: {item.gift.recipientSnapshot.minecraftIgn}
												{/if}
												{#if item.gift.recipientSnapshot.discordUserId}
													&middot; Discord: {item.gift.recipientSnapshot.discordUserId}
												{/if}
											</div>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Tebex State -->
				{#if order.tebex}
					<Card.Root>
						<Card.Header>
							<Card.Title>Tebex Provider State</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
								{#if order.tebex.basketIdent}
									<div>
										<p class="text-muted-foreground text-xs">Basket</p>
										<div class="flex max-w-fit items-center gap-2">
											<CopyToClipboard text={order.tebex.basketIdent} size="sm" />
											<p class="truncate font-mono text-xs">{order.tebex.basketIdent}</p>
										</div>
									</div>
								{/if}
								{#if order.tebex.basketUrl}
									<div>
										<p class="text-muted-foreground text-xs">Basket URL</p>
										<div class="flex max-w-fit items-center gap-2">
											<CopyToClipboard text={order.tebex.basketUrl} size="sm" />
											<a
												href={order.tebex.basketUrl}
												target="_blank"
												class="truncate text-xs underline"
											>
												{order.tebex.basketUrl}
											</a>
										</div>
									</div>
								{/if}
								{#if order.tebex.providerStatus}
									<div>
										<p class="text-muted-foreground text-xs">Provider Status</p>
										<p>{humanize(order.tebex.providerStatus)}</p>
									</div>
								{/if}
								{#if order.tebex.lastSyncedAt}
									<div>
										<p class="text-muted-foreground text-xs">Last Synced</p>
										<p>{formatDate(order.tebex.lastSyncedAt)}</p>
									</div>
								{/if}
								{#if order.tebex.recurringReference}
									<div>
										<p class="text-muted-foreground text-xs">Recurring Ref</p>
										<p class="font-mono text-xs">{order.tebex.recurringReference}</p>
									</div>
								{/if}
							</div>

							{#if order.tebex.payment}
								<Separator class="my-3" />
								<p class="text-muted-foreground mb-2 text-xs font-medium uppercase">Payment</p>
								<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
									{#if order.tebex.payment.transactionId}
										<div>
											<p class="text-muted-foreground text-xs">Transaction</p>
											<p class="font-mono text-xs">{order.tebex.payment.transactionId}</p>
										</div>
									{/if}
									{#if order.tebex.payment.status}
										<div>
											<p class="text-muted-foreground text-xs">Status</p>
											<Badge variant={getStatusVariant(order.tebex.payment.status)}>
												{humanize(order.tebex.payment.status)}
											</Badge>
										</div>
									{/if}
									{#if order.tebex.payment.paymentMethod}
										<div>
											<p class="text-muted-foreground text-xs">Method</p>
											<p>{order.tebex.payment.paymentMethod}</p>
										</div>
									{/if}
									{#if order.tebex.payment.price != null}
										<div>
											<p class="text-muted-foreground text-xs">Price</p>
											<p>
												{formatCurrency(
													order.tebex.payment.price,
													order.tebex.payment.currency ?? order.currency
												)}
											</p>
										</div>
									{/if}
									{#if order.tebex.payment.pricePaid != null}
										<div>
											<p class="text-muted-foreground text-xs">Paid</p>
											<p>
												{formatCurrency(
													order.tebex.payment.pricePaid,
													order.tebex.payment.currency ?? order.currency
												)}
											</p>
										</div>
									{/if}
									{#if order.tebex.payment.refundable != null}
										<div>
											<p class="text-muted-foreground text-xs">Refundable</p>
											<p>{order.tebex.payment.refundable ? 'Yes' : 'No'}</p>
										</div>
									{/if}
									{#if order.tebex.payment.declineReason}
										<div class="col-span-2">
											<p class="text-destructive text-xs">Decline Reason</p>
											<p class="text-destructive text-sm">{order.tebex.payment.declineReason}</p>
										</div>
									{/if}
								</div>
							{/if}

							{#if order.tebex.recurring}
								<Separator class="my-3" />
								<p class="text-muted-foreground mb-2 text-xs font-medium uppercase">Recurring</p>
								<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
									{#if order.tebex.recurring.reference}
										<div>
											<p class="text-muted-foreground text-xs">Reference</p>
											<p class="font-mono text-xs">{order.tebex.recurring.reference}</p>
										</div>
									{/if}
									{#if order.tebex.recurring.status}
										<div>
											<p class="text-muted-foreground text-xs">Status</p>
											<Badge variant={getStatusVariant(order.tebex.recurring.status)}>
												{humanize(order.tebex.recurring.status)}
											</Badge>
										</div>
									{/if}
									{#if order.tebex.recurring.isActive != null}
										<div>
											<p class="text-muted-foreground text-xs">Active</p>
											<p>{order.tebex.recurring.isActive ? 'Yes' : 'No'}</p>
										</div>
									{/if}
									{#if order.tebex.recurring.interval}
										<div>
											<p class="text-muted-foreground text-xs">Interval</p>
											<p>{order.tebex.recurring.interval}</p>
										</div>
									{/if}
									{#if order.tebex.recurring.nextPaymentDate}
										<div>
											<p class="text-muted-foreground text-xs">Next Payment</p>
											<p>{formatDate(order.tebex.recurring.nextPaymentDate)}</p>
										</div>
									{/if}
									{#if order.tebex.recurring.amount != null}
										<div>
											<p class="text-muted-foreground text-xs">Amount</p>
											<p>{formatCurrency(order.tebex.recurring.amount, order.currency)}</p>
										</div>
									{/if}
									{#if order.tebex.recurring.pausedAt}
										<div>
											<p class="text-muted-foreground text-xs">Paused At</p>
											<p>{formatDate(order.tebex.recurring.pausedAt)}</p>
										</div>
									{/if}
									{#if order.tebex.recurring.pausedUntil}
										<div>
											<p class="text-muted-foreground text-xs">Paused Until</p>
											<p>{formatDate(order.tebex.recurring.pausedUntil)}</p>
										</div>
									{/if}
									{#if order.tebex.recurring.cancelledAt}
										<div>
											<p class="text-destructive text-xs">Cancelled At</p>
											<p class="text-destructive">
												{formatDate(order.tebex.recurring.cancelledAt)}
											</p>
										</div>
									{/if}
									{#if order.tebex.recurring.cancelReason}
										<div class="col-span-2">
											<p class="text-destructive text-xs">Cancel Reason</p>
											<p class="text-destructive text-sm">{order.tebex.recurring.cancelReason}</p>
										</div>
									{/if}
								</div>
							{/if}

							{#if order.tebex.expectedBasket || order.tebex.basketMismatch}
								<Separator class="my-3" />
								{#if order.tebex.basketMismatch}
									<div class="border-destructive/30 bg-destructive/5 rounded-md border px-3 py-2">
										<p class="text-destructive text-sm font-medium">Basket Mismatch Detected</p>
									</div>
								{/if}
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Provider Events -->
				<Card.Root>
					<Card.Header>
						<div class="flex items-center justify-between">
							<Card.Title>Provider Events</Card.Title>
							<Button variant="outline" size="sm" onclick={loadEvents} disabled={eventsLoading}>
								{#if eventsLoading}
									<Loader2 class="mr-2 size-4 animate-spin" />
								{:else}
									<RefreshCw class="mr-2 size-4" />
								{/if}
								{events.length > 0 ? 'Refresh' : 'Load Events'}
							</Button>
						</div>
					</Card.Header>
					<Card.Content>
						{#if events.length === 0 && !eventsLoading}
							<p class="text-muted-foreground py-4 text-center text-sm">
								Click "Load Events" to fetch the provider event log for this order.
							</p>
						{:else if events.length > 0}
							<div class="rounded-md border">
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Type</Table.Head>
											<Table.Head>Source</Table.Head>
											<Table.Head>Occurred</Table.Head>
											<Table.Head>External ID</Table.Head>
											<Table.Head class="text-right">Payload</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each events as event (event.id)}
											<Table.Row>
												<Table.Cell>
													<Badge variant="secondary" class="text-xs"
														>{event.eventType ?? 'unknown'}</Badge
													>
												</Table.Cell>
												<Table.Cell class="text-xs">{event.source}</Table.Cell>
												<Table.Cell class="text-xs whitespace-nowrap"
													>{formatDate(event.occurredAt)}</Table.Cell
												>
												<Table.Cell class="font-mono text-xs"
													>{event.externalEventId ?? '-'}</Table.Cell
												>
												<Table.Cell class="text-right">
													{#if event.payloadJson}
														<Button
															variant="ghost"
															size="sm"
															onclick={() => {
																selectedEvent = event;
															}}
														>
															View
														</Button>
													{:else}
														<span class="text-muted-foreground text-xs">-</span>
													{/if}
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Actions sidebar -->
			<div class="flex flex-col gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>Actions</Card.Title>
						<Card.Description>
							Administrative actions for this order. Some actions are irreversible.
						</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2">
						<Button
							variant="outline"
							class="w-full justify-start"
							disabled={!!actionLoading}
							onclick={doRefreshProvider}
						>
							{#if actionLoading === 'refresh'}
								<Loader2 class="mr-2 size-4 animate-spin" />
							{:else}
								<RefreshCw class="mr-2 size-4" />
							{/if}
							Refresh Provider State
						</Button>

						<Button
							variant="outline"
							class="w-full justify-start"
							disabled={!!actionLoading}
							onclick={doReconcile}
						>
							{#if actionLoading === 'reconcile'}
								<Loader2 class="mr-2 size-4 animate-spin" />
							{/if}
							Reconcile Order
						</Button>

						<Button
							variant="outline"
							class="w-full justify-start"
							disabled={!!actionLoading}
							onclick={() => {
								resolveDialogOpen = true;
							}}
						>
							Resolve Recipient
						</Button>

						<Separator />

						{#if order?.recurringReference}
							<p class="text-muted-foreground text-xs font-medium uppercase">Recurring</p>

							<Button
								variant="outline"
								class="w-full justify-start"
								disabled={!!actionLoading}
								onclick={() => {
									pauseDialogOpen = true;
								}}
							>
								Pause Recurring
							</Button>

							<Button
								variant="outline"
								class="w-full justify-start"
								disabled={!!actionLoading}
								onclick={doResumeRecurring}
							>
								{#if actionLoading === 'resume'}
									<Loader2 class="mr-2 size-4 animate-spin" />
								{/if}
								Resume Recurring
							</Button>

							<Button
								variant="destructive"
								class="w-full justify-start"
								disabled={!!actionLoading}
								onclick={doCancelRecurring}
							>
								{#if actionLoading === 'cancel'}
									<Loader2 class="mr-2 size-4 animate-spin" />
								{/if}
								Cancel Recurring
							</Button>

							<Separator />
						{/if}

						<Button
							variant="destructive"
							class="w-full justify-start"
							disabled={!!actionLoading}
							onclick={() => {
								refundDialogOpen = true;
							}}
						>
							Refund Order
						</Button>

						<Separator />

						<p class="text-muted-foreground text-xs font-medium uppercase">Webhooks</p>

						<Button
							variant="outline"
							class="w-full justify-start"
							disabled={!!actionLoading}
							onclick={() => {
								replayDialogOpen = true;
								replayResult = null;
								replayWebhookId = '';
							}}
						>
							Replay Webhook
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</div>

<!-- Reconcile Result Dialog -->
<Dialog.Root bind:open={reconcileDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Reconciliation Result</Dialog.Title>
		</Dialog.Header>
		{#if reconcileResult}
			<div class="flex flex-col gap-3 text-sm">
				<div class="grid grid-cols-2 gap-2">
					<p class="text-muted-foreground">Orders Processed</p>
					<p class="font-medium">{reconcileResult.ordersProcessed}</p>
					<p class="text-muted-foreground">Orders Resolved</p>
					<p class="font-medium">{reconcileResult.ordersResolved}</p>
					<p class="text-muted-foreground">Access Granted</p>
					<p class="font-medium">{reconcileResult.accessGranted}</p>
				</div>
				{#if reconcileResult.errors.length > 0}
					<div class="border-destructive/30 bg-destructive/5 rounded-md border px-3 py-2">
						<p class="text-destructive mb-1 text-xs font-medium">Errors</p>
						{#each reconcileResult.errors as err, i (i)}
							<p class="text-destructive text-xs">{err}</p>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Refund Confirmation Dialog -->
<Dialog.Root bind:open={refundDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Confirm Refund</Dialog.Title>
			<Dialog.Description>
				This will refund the order through Tebex. This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-2">
			<Button
				variant="outline"
				onclick={() => {
					refundDialogOpen = false;
				}}>Cancel</Button
			>
			<Button variant="destructive" disabled={actionLoading === 'refund'} onclick={doRefund}>
				{#if actionLoading === 'refund'}
					<Loader2 class="mr-2 size-4 animate-spin" />
				{/if}
				Refund Order
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Resolve Recipient Dialog -->
<Dialog.Root bind:open={resolveDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Resolve Gift Recipient</Dialog.Title>
			<Dialog.Description>Manually set the recipient for this gifted order.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<Label>Recipient Type</Label>
				<div class="flex gap-2">
					<Button
						variant={resolveRecipientType === 'user' ? 'default' : 'outline'}
						size="sm"
						onclick={() => {
							resolveRecipientType = 'user';
						}}
					>
						Minecraft
					</Button>
					<Button
						variant={resolveRecipientType === 'guild' ? 'default' : 'outline'}
						size="sm"
						onclick={() => {
							resolveRecipientType = 'guild';
						}}
					>
						Guild
					</Button>
				</div>
			</div>

			{#if resolveRecipientType === 'user'}
				<div class="flex flex-col gap-2">
					<Label>Minecraft UUID</Label>
					<Input placeholder="Enter UUID" bind:value={resolveMinecraftUuid} />
				</div>
			{:else}
				<div class="flex flex-col gap-2">
					<Label>Guild ID</Label>
					<Input placeholder="Enter Guild ID" bind:value={resolveGuildId} />
				</div>
			{/if}

			<div class="flex justify-end gap-2">
				<Button
					variant="outline"
					onclick={() => {
						resolveDialogOpen = false;
					}}>Cancel</Button
				>
				<Button disabled={actionLoading === 'resolve'} onclick={doResolveRecipient}>
					{#if actionLoading === 'resolve'}
						<Loader2 class="mr-2 size-4 animate-spin" />
					{/if}
					Resolve
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Pause Recurring Dialog -->
<Dialog.Root bind:open={pauseDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Pause Recurring Payment</Dialog.Title>
			<Dialog.Description>Set a date until which the recurring payment should be paused.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<Label>Pause Until</Label>
				<Input type="datetime-local" bind:value={pauseUntil} />
			</div>
			<div class="flex justify-end gap-2">
				<Button
					variant="outline"
					onclick={() => {
						pauseDialogOpen = false;
					}}>Cancel</Button
				>
				<Button disabled={!pauseUntil || actionLoading === 'pause'} onclick={doPauseRecurring}>
					{#if actionLoading === 'pause'}
						<Loader2 class="mr-2 size-4 animate-spin" />
					{/if}
					Pause
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Replay Webhook Dialog -->
<Dialog.Root bind:open={replayDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Replay Webhook</Dialog.Title>
			<Dialog.Description>
				Replay a webhook event by its ID. This will re-process the event as if it were received again.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<Label>Webhook ID</Label>
				<Input placeholder="Enter webhook event ID" bind:value={replayWebhookId} />
			</div>

			{#if replayResult}
				<div
					class="rounded-md border px-3 py-2 text-sm {replayResult.succeeded
						? 'border-green-500/30 bg-green-500/5'
						: 'border-destructive/30 bg-destructive/5'}"
				>
					<p class="font-medium {replayResult.succeeded ? 'text-green-600' : 'text-destructive'}">
						{replayResult.succeeded ? 'Replay Succeeded' : 'Replay Failed'}
					</p>
					{#if replayResult.orderId}
						<p class="text-muted-foreground text-xs">Order: {replayResult.orderId}</p>
					{/if}
					{#if replayResult.failureReason}
						<p class="text-destructive text-xs">{replayResult.failureReason}</p>
					{/if}
					{#if replayResult.processedAt}
						<p class="text-muted-foreground text-xs">Processed: {formatDate(replayResult.processedAt)}</p>
					{/if}
				</div>
			{/if}

			<div class="flex justify-end gap-2">
				<Button
					variant="outline"
					onclick={() => {
						replayDialogOpen = false;
					}}>Close</Button
				>
				<Button disabled={!replayWebhookId.trim() || actionLoading === 'replay'} onclick={doReplayWebhook}>
					{#if actionLoading === 'replay'}
						<Loader2 class="mr-2 size-4 animate-spin" />
					{/if}
					Replay
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Event Payload Dialog -->
<Dialog.Root
	open={!!selectedEvent}
	onOpenChange={(v) => {
		if (!v) selectedEvent = null;
	}}
>
	<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Event Payload</Dialog.Title>
			{#if selectedEvent}
				<Dialog.Description>
					{selectedEvent.eventType ?? 'Unknown event'} &middot; {formatDate(selectedEvent.occurredAt)}
				</Dialog.Description>
			{/if}
		</Dialog.Header>
		{#if selectedEvent?.payloadJson}
			<pre class="bg-muted max-h-96 overflow-auto rounded-md p-4 text-xs">{(() => {
					try {
						return JSON.stringify(JSON.parse(selectedEvent.payloadJson), null, 2);
					} catch {
						return selectedEvent.payloadJson;
					}
				})()}</pre>
		{/if}
	</Dialog.Content>
</Dialog.Root>
