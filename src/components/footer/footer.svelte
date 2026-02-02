<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/state';
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import {
		PUBLIC_COMMUNITY_INVITE,
		PUBLIC_DONATION_URL,
		PUBLIC_GTAG_MEASUREMENT_ID,
		PUBLIC_SUPPORT_SERVER_INVITE,
	} from '$env/static/public';
	import { getAdCtx } from '$lib/hooks/ads.svelte';
	import { Button } from '$ui/button';
	import { Separator } from '$ui/separator';
	import * as CookieConsent from 'vanilla-cookieconsent';

	const adCtx = getAdCtx();
</script>

<footer
	class="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 bottom-0 mt-4 flex w-full flex-col pb-4 backdrop-blur"
	style={adCtx.bottomAnchorSize.height ? `margin-bottom: ${adCtx.bottomAnchorSize.height}px;` : ''}
>
	<div class="container flex flex-wrap items-start justify-between">
		<div class="flex flex-1 basis-32 flex-col items-start gap-2 py-4">
			<h5 class="text-lg font-semibold">Support</h5>
			<Separator />
			<Button
				variant="link"
				rel="nofollow noreferrer noopener"
				class="h-8 p-0"
				href={PUBLIC_SUPPORT_SERVER_INVITE}>Support Discord</Button
			>
			<Button variant="link" class="h-8 p-0" href="/info">Site Information</Button>
			<Button variant="link" class="h-8 p-0" href="/terms">Terms of Service</Button>
			<Button variant="link" class="h-8 p-0" href="/privacy">Privacy Policy</Button>
			{#if PUBLIC_GTAG_MEASUREMENT_ID}
				<Button variant="link" class="h-8 p-0" onclick={CookieConsent.showPreferences}>Cookie Settings</Button>
			{/if}
		</div>
		<div class="flex flex-1 basis-32 flex-col items-start gap-2 py-4">
			<h5 class="text-lg font-semibold">Community</h5>
			<Separator />
			<Button variant="link" class="h-8 p-0" href="/browse">Browse Servers</Button>
			<Button variant="link" rel="nofollow noreferrer noopener" class="h-8 p-0" href={PUBLIC_COMMUNITY_INVITE}
				>Elite Farmers Discord</Button
			>
			<Button variant="link" class="h-8 p-0" href="/wiki">Elite Farmers Wiki</Button>
			<Button variant="link" rel="nofollow noreferrer noopener" class="h-8 p-0" href="https://hypixel.net/forums"
				>Hypixel Forums</Button
			>
		</div>
		<div class="flex flex-1 basis-32 flex-col items-start gap-2 py-4">
			<h5 class="text-lg font-semibold">Help Out</h5>
			<Separator />
			<Button variant="link" class="h-8 p-0" href="/shop">Shop</Button>
			<Button variant="link" rel="nofollow noreferrer noopener" class="h-8 p-0" href={PUBLIC_DONATION_URL}
				>Donate on Ko-Fi</Button
			>
			<Button variant="link" class="h-8 p-0" href="/info/badges">Unlock Badges</Button>
		</div>
		<div class="flex flex-1 basis-32 flex-col items-start gap-2 py-4">
			<h5 class="text-lg font-semibold">Made by Kaeso</h5>
			<Separator />
			<Button variant="link" class="h-8 p-0" href="/contact">Contact / Imprint</Button>
			<Button
				variant="link"
				rel="nofollow noreferrer noopener"
				class="h-8 p-0"
				href="https://github.com/EliteFarmers/Website">Open Source on GitHub</Button
			>
			<Button variant="link" class="h-8 p-0" href="/info/credits">Website Credits</Button>
			<Button variant="link" class="h-8 p-0" href="/oss">Open Sourced Software</Button>
		</div>
	</div>
	<div class="flex w-full flex-col gap-2 px-4 md:px-8">
		<span data-ccpa-link="1" class="text-sm hover:underline"></span>
		<div id="ncmp-consent-link" class="text-sm hover:underline"></div>

		<div class="flex w-full flex-wrap items-start justify-center gap-x-4 gap-y-2 md:gap-x-8">
			{#if version !== ''}
				<p class="text-muted-foreground/50 flex-1 text-xs">
					Running version <a
						href="https://github.com/EliteFarmers/Website/commit/{version}"
						target="_blank"
						class="bg-card text-muted-foreground rounded-sm border p-0.5 hover:underline">{version}</a
					>
				</p>
			{/if}
			<p class="text-muted-foreground/50 text-xs">Not affiliated with Hypixel, Inc.</p>
			<p class="text-muted-foreground/50 text-xs">
				NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
			</p>
		</div>
		<div
			class="text-muted-foreground/50 [&_a]:text-muted-foreground/50 flex w-full flex-col items-center justify-start text-xs md:items-start"
		>
			<div class="w-fit">
				<RenderHtml content={page.data.cache.footer} />
			</div>
		</div>
	</div>
</footer>
