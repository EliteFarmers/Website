<script lang="ts">
	import PlayerSearch from '$comp/player-search.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { Button } from '$ui/button';
	import Gift from '@lucide/svelte/icons/gift';
	import Search from '@lucide/svelte/icons/search';
	import UserRound from '@lucide/svelte/icons/user-round';

	interface Props {
		giftIntent: 'self' | 'gift';
		effectiveRecipientIgn: string | null;
		selfCheckoutUnavailable: boolean;
		hasNonGiftableItemsForGift: boolean;
		settingRecipient: boolean;
		editingGiftRecipient: boolean;
		onchooseself: () => void;
		onchoosegift: () => void;
		onselectrecipient: (ign: string) => void;
		onstartchanging: () => void;
		onstopchanging: () => void;
		oncleargift: () => void;
	}

	let {
		giftIntent,
		effectiveRecipientIgn,
		selfCheckoutUnavailable,
		hasNonGiftableItemsForGift,
		settingRecipient,
		editingGiftRecipient,
		onchooseself,
		onchoosegift,
		onselectrecipient,
		onstartchanging,
		onstopchanging,
		oncleargift,
	}: Props = $props();

	let giftSearchOpen = $state(false);
	let giftSearchValue = $state('');

	function openGiftSearch() {
		giftSearchValue = '';
		giftSearchOpen = true;
	}

	function handleSelectRecipient(ign: string) {
		giftSearchOpen = false;
		giftSearchValue = '';
		onselectrecipient(ign);
	}
</script>

<section class="border-border/60 bg-card/70 rounded-4xl border p-6 shadow-sm sm:p-8">
	<h2 class="text-2xl font-black tracking-tight">Who should receive this order?</h2>

	<div class="mt-6 grid gap-3 sm:grid-cols-2">
		<button
			type="button"
			class={giftIntent === 'self'
				? 'border-primary bg-primary/5 hover:bg-primary/10 rounded-3xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60'
				: 'border-border bg-background hover:bg-card rounded-3xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60'}
			onclick={onchooseself}
			disabled={selfCheckoutUnavailable}
		>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-2xl">
					<UserRound class="size-5" />
				</div>
				<div>
					<p class="font-semibold">For my account</p>
					<p class="text-muted-foreground text-sm">
						{#if selfCheckoutUnavailable}
							Unavailable because this basket includes something you already own.
						{:else}
							Use these items yourself.
						{/if}
					</p>
				</div>
			</div>
		</button>

		<button
			type="button"
			class={giftIntent === 'gift'
				? 'border-primary bg-primary/5 hover:bg-primary/10 rounded-3xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60'
				: 'border-border bg-background hover:bg-card rounded-3xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60'}
			onclick={onchoosegift}
			disabled={hasNonGiftableItemsForGift}
		>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-2xl">
					<Gift class="size-5" />
				</div>
				<div>
					<p class="font-semibold">Send as a gift</p>
					<p class="text-muted-foreground text-sm">Choose another player before checkout.</p>
				</div>
			</div>
		</button>
	</div>

	{#if selfCheckoutUnavailable}
		<div class="mt-5 rounded-3xl border border-amber-500/20 bg-amber-500/8 p-4">
			<p class="text-sm font-semibold">This order needs to stay as a gift.</p>
			<p class="text-muted-foreground mt-1 text-sm leading-relaxed">
				Your basket includes an item that is already active on your account, so Tebex can only continue once you
				choose another player as the recipient.
			</p>
		</div>
	{/if}

	{#if hasNonGiftableItemsForGift}
		<div class="mt-5 rounded-3xl border border-amber-500/20 bg-amber-500/8 p-4">
			<p class="text-sm font-semibold">This checkout includes items that cannot be gifted.</p>
			<p class="text-muted-foreground mt-1 text-sm leading-relaxed">
				Remove the non-giftable item or keep this checkout on your own account.
			</p>
		</div>
	{/if}

	<div class="mt-5 rounded-3xl border border-dashed p-4">
		{#if giftIntent === 'self'}
			<div class="flex items-center gap-3">
				<div class="bg-muted flex size-11 items-center justify-center rounded-2xl">
					<UserRound class="text-muted-foreground size-5" />
				</div>
				<div>
					<p class="font-semibold">Buying for yourself</p>
					<p class="text-muted-foreground text-sm">These items will be tied to your own Elite account.</p>
				</div>
			</div>
		{:else if effectiveRecipientIgn}
			<div class="space-y-4">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<PlayerHead uuid={effectiveRecipientIgn} class="size-11 rounded-md" />
						<div>
							<p class="font-semibold">Gift recipient: {effectiveRecipientIgn}</p>
							<p class="text-muted-foreground text-sm">
								Make sure this is the right player before continuing.
							</p>
						</div>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								onstartchanging();
								openGiftSearch();
							}}
							disabled={settingRecipient}
						>
							Change recipient
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onclick={oncleargift}
							disabled={settingRecipient || selfCheckoutUnavailable}
						>
							Buy for me instead
						</Button>
					</div>
				</div>

				{#if editingGiftRecipient}
					<div class="space-y-3 border-t pt-4">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-semibold">Choose a different player</p>
								<p class="text-muted-foreground text-sm">
									Updating the recipient will keep this order as a gift.
								</p>
							</div>
							<Button variant="ghost" size="sm" onclick={onstopchanging}>
								Keep {effectiveRecipientIgn}
							</Button>
						</div>
						<Button
							variant="outline"
							class="w-full justify-start"
							onclick={openGiftSearch}
							disabled={settingRecipient}
						>
							<Search class="size-4" />
							Choose another player
						</Button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="space-y-3">
				<div>
					<p class="font-semibold">Pick a player for this gift</p>
					<p class="text-muted-foreground text-sm">
						Search by player name so the order goes to the right account.
					</p>
				</div>
				<Button
					variant="outline"
					class="w-full justify-start"
					onclick={openGiftSearch}
					disabled={settingRecipient}
				>
					<Search class="size-4" />
					Search for a player
				</Button>
			</div>
		{/if}
	</div>
</section>

<PlayerSearch useButton={false} bind:open={giftSearchOpen} bind:search={giftSearchValue} cmd={handleSelectRecipient} />
