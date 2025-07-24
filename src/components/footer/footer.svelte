<script lang="ts">
	import {
		PUBLIC_SUPPORT_SERVER_INVITE,
		PUBLIC_COMMUNITY_INVITE,
		PUBLIC_DONATION_URL,
		PUBLIC_COMMIT_HASH,
	} from '$env/static/public';
	import { Button } from '$ui/button';
	import { Separator } from '$ui/separator';
</script>

<footer
	class="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 bottom-0 mt-4 flex w-full flex-col pb-4 backdrop-blur"
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
			<Button variant="link" rel="noopener" class="h-8 p-0" href="/stickers">Purchase Stickers</Button>
		</div>
		<div class="flex flex-1 basis-32 flex-col items-start gap-2 py-4">
			<h5 class="text-lg font-semibold">Made by Kaeso</h5>
			<Separator />
			<Button variant="link" class="h-8 p-0" href="/contact">Contact</Button>
			<Button
				variant="link"
				rel="nofollow noreferrer noopener"
				class="h-8 p-0"
				href="https://github.com/EliteFarmers/Website">Open Source on GitHub</Button
			>
			<Button variant="link" class="h-8 p-0" href="/info#Credits">Website Credits</Button>
			<Button variant="link" class="h-8 p-0" href="/oss">Open Sourced Software</Button>
		</div>
	</div>
	{#if PUBLIC_COMMIT_HASH !== ''}
		<div class="flex w-full flex-row items-center justify-start gap-2 px-4 md:px-8">
			<p class="text-muted-foreground text-xs">
				Running version <a
					href="https://github.com/EliteFarmers/Website/commit/{PUBLIC_COMMIT_HASH}"
					class="bg-card text-primary rounded-sm border p-0.5 hover:underline">{PUBLIC_COMMIT_HASH}</a
				>
			</p>
		</div>
	{/if}
</footer>
