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

<footer class="relative mt-24 border-t border-border/50 bg-linear-to-b from-transparent via-background to-card/60">
	<div class="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
		<section
			class="relative overflow-hidden rounded-4xl border border-border/60 bg-linear-to-br from-card to-card/70 p-8 shadow-sm"
		>
			<div class="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl"></div>
			<div class="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
				<div class="space-y-3">
					<div class="inline-flex items-center gap-2 text-sm font-semibold text-primary">
						<Sparkles class="size-4" />
						Back to Elite
					</div>
					<h2 class="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Done shopping?</h2>
					<p class="max-w-2xl text-sm text-muted-foreground sm:text-base">
						Equip your new cosmetics or jump back into your stats.
					</p>
				</div>

				<div class="grid gap-3">
					{#each storefront.exitLinks as link (link.id)}
						<a
							href={link.href}
							class="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 transition-colors hover:bg-card"
						>
							<div>
								<p class="font-semibold">{link.label}</p>
								{#if link.description}
									<p class="mt-1 text-sm text-muted-foreground">{link.description}</p>
								{/if}
							</div>
							<ArrowRight class="size-5 shrink-0 text-primary group-hover:animate-bounce-horizontal" />
						</a>
					{/each}
				</div>
			</div>
		</section>

		<div class="grid gap-10 md:grid-cols-3">
			<div class="space-y-3">
				<p class="text-sm font-semibold">Elite Shop</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
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

		<div class="flex flex-col gap-3 border-t border-border/50 pt-6 text-xs">
			<p class="text-muted-foreground">Not affiliated with Hypixel, Mojang, or Microsoft.</p>
			{#if footerHtml}
				<div class="text-muted-foreground [&_a]:text-foreground [&_a]:underline-offset-2 [&_a]:hover:underline">
					<RenderHtml content={footerHtml} />
				</div>
			{/if}
		</div>
	</div>
</footer>
