<script lang="ts">
	import { PUBLIC_SUPPORT_SERVER_INVITE, PUBLIC_COMMUNITY_INVITE, PUBLIC_DONATION_URL } from '$env/static/public';
	import { Button } from '$ui/button';
	import { Separator } from '$ui/separator';
</script>

<footer
	class="bottom-0 mt-16 z-50 w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex flex-wrap max-w-screen-lg items-start justify-between">
		<div class="flex flex-1 basis-32 py-4 flex-col gap-2 items-start">
			<h5 class="text-lg font-semibold">Support</h5>
			<Separator />
			<Button
				variant="link"
				rel="nofollow noreferrer noopener"
				class="p-0 h-8"
				href={PUBLIC_SUPPORT_SERVER_INVITE}>Support Discord</Button
			>
			<Button variant="link" class="p-0 h-8" href="/info">Site Information</Button>
			<Button variant="link" class="p-0 h-8" href="/terms">Terms of Service</Button>
			<Button variant="link" class="p-0 h-8" href="/privacy">Privacy Policy</Button>
		</div>
		<div class="flex flex-1 basis-32 py-4 flex-col gap-2 items-start">
			<h5 class="text-lg font-semibold">Community</h5>
			<Separator />
			<Button variant="link" class="p-0 h-8" href="/browse">Browse Servers</Button>
			<Button variant="link" rel="nofollow noreferrer noopener" class="p-0 h-8" href={PUBLIC_COMMUNITY_INVITE}
				>Elite Farmers Discord</Button
			>
			<Button variant="link" class="p-0 h-8" href="/wiki">Elite Farmers Wiki</Button>
			<Button variant="link" rel="nofollow noreferrer noopener" class="p-0 h-8" href="https://hypixel.net/forums"
				>Hypixel Forums</Button
			>
		</div>
		<div class="flex flex-1 basis-32 py-4 flex-col gap-2 items-start">
			<h5 class="text-lg font-semibold">Help Out</h5>
			<Separator />
			<Button variant="link" class="p-0 h-8" href="/shop">Shop</Button>
			<Button variant="link" rel="nofollow noreferrer noopener" class="p-0 h-8" href={PUBLIC_DONATION_URL}
				>Donate on Ko-Fi</Button
			>
			<Button
				variant="link"
				rel="noopener"
				class="p-0 h-8"
				href="https://www.etsy.com/listing/1499421785/pixelated-crop-stickers">Purchase Stickers</Button
			>
		</div>
		<div class="flex flex-1 basis-32 py-4 flex-col gap-2 items-start md:items-end">
			<h5 class="text-lg font-semibold">Made by Kaeso</h5>
			<Separator />
			<Button
				variant="link"
				rel="nofollow noreferrer noopener"
				class="p-0 h-8"
				href="https://github.com/EliteFarmers/Website">Open Source on GitHub</Button
			>
			<Button variant="link" class="p-0 h-8" href="/info#Credits">Website Credits</Button>
			<Button variant="link" class="p-0 h-8" href="/oss">Open Sourced Software</Button>
		</div>
	</div>
</footer>
