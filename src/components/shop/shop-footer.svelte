<script lang="ts">
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import { env } from '$env/dynamic/public';
	import type { ShopStorefrontResponse } from '$lib/shop/storefront';
	import { Button } from '$ui/button';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	interface Props {
		storefront: ShopStorefrontResponse;
		footerHtml?: string;
	}

	let { storefront, footerHtml = '' }: Props = $props();

	const { PUBLIC_COMMUNITY_INVITE, PUBLIC_SUPPORT_SERVER_INVITE } = env;
</script>

<footer class="border-border/50 via-background to-card/60 relative mt-24 border-t bg-linear-to-b from-transparent">
	<div class="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
		<section
			class="from-card to-card/70 border-border/60 relative overflow-hidden rounded-4xl border bg-linear-to-br p-8 shadow-sm"
		>
			<div class="bg-primary/10 absolute top-0 right-0 h-48 w-48 rounded-full blur-3xl"></div>
			<div class="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
				<div class="space-y-3">
					<div class="text-primary inline-flex items-center gap-2 text-sm font-semibold">
						<Sparkles class="size-4" />
						Back to Elite
					</div>
					<h2 class="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Done shopping?</h2>
					<p class="text-muted-foreground max-w-2xl text-sm sm:text-base">
						Equip your new cosmetics or jump back into your stats.
					</p>
				</div>

				<div class="grid gap-3">
					{#each storefront.exitLinks as link (link.id)}
						<a
							href={link.href}
							class="border-border/60 bg-background/80 hover:bg-card group flex items-center justify-between gap-4 rounded-2xl border p-4 transition-colors"
						>
							<div>
								<p class="font-semibold">{link.label}</p>
								{#if link.description}
									<p class="text-muted-foreground mt-1 text-sm">{link.description}</p>
								{/if}
							</div>
							<ArrowRight class="text-primary group-hover:animate-bounce-horizontal size-5 shrink-0" />
						</a>
					{/each}
				</div>
			</div>
		</section>

		<div class="grid gap-10 md:grid-cols-3">
			<div class="space-y-3">
				<p class="text-sm font-semibold">Elite Shop</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Cosmetics and account perks for the Elite Skyblock community.
				</p>
			</div>

			<div class="space-y-4">
				<p class="text-sm font-semibold">Support</p>
				<div class="flex flex-col items-start gap-2">
					<Button variant="link" class="h-auto p-0" href="/shop">Shop Home</Button>
					<Button variant="link" class="h-auto p-0" href="/profile/purchases">Purchase History</Button>
					<Button variant="link" class="h-auto p-0" href="/profile/settings">Profile Settings</Button>
					{#if PUBLIC_SUPPORT_SERVER_INVITE}
						<Button
							variant="link"
							class="h-auto p-0"
							rel="nofollow noreferrer noopener"
							href={PUBLIC_SUPPORT_SERVER_INVITE}
						>
							Support Discord
						</Button>
					{/if}
				</div>
			</div>

			<div class="space-y-4">
				<p class="text-sm font-semibold">Explore</p>
				<div class="flex flex-col items-start gap-2">
					<Button variant="link" class="h-auto p-0" href="/">Elite Home</Button>
					<Button variant="link" class="h-auto p-0" href="/info">Site Information</Button>
					<Button variant="link" class="h-auto p-0" href="/terms">Terms of Service</Button>
					<Button variant="link" class="h-auto p-0" href="/privacy">Privacy Policy</Button>
					{#if PUBLIC_COMMUNITY_INVITE}
						<Button
							variant="link"
							class="h-auto p-0"
							rel="nofollow noreferrer noopener"
							href={PUBLIC_COMMUNITY_INVITE}
						>
							Community Discord
						</Button>
					{/if}
				</div>
			</div>
		</div>

		<div class="border-border/50 flex flex-col gap-3 border-t pt-6 text-xs">
			<p class="text-muted-foreground">Not affiliated with Hypixel, Mojang, or Microsoft.</p>
			{#if footerHtml}
				<div class="text-muted-foreground [&_a]:text-foreground [&_a]:underline-offset-2 [&_a]:hover:underline">
					<RenderHtml content={footerHtml} />
				</div>
			{/if}
		</div>
	</div>
</footer>
