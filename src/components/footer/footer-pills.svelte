<div class="mx-4 mt-24 flex flex-wrap items-center justify-center gap-4 md:mx-8" role="banner">
	<div
		class="group border-border/50 bg-card relative h-24 w-64 rounded-md border-2 bg-cover hover:shadow-lg"
		style="background-image: url(/images/LuminiBanner.webp);"
	>
		<a href="/stickers" rel="noopener nofollow" target="_blank" class="h-full w-full">
			<div class="h-full w-full px-4 py-2">
				<p class="text-xl text-black">Sticker Shop</p>
				<div class="absolute top-4 right-4 size-16 overflow-visible rounded-md">
					<div class="sticker-sprite relative size-full"></div>
				</div>
			</div>
		</a>
		<div
			class="bg-card absolute -top-8 -right-[2px] hidden h-8 w-fit rounded-md border-2 px-2 transition-all duration-200 group-hover:block"
		>
			<span class="text-xs">
				Unlock <strong>Patron of The Arts</strong>
				<a href="/info#Badges" class="text-link hover:underline">badge</a>!
			</span>
		</div>
	</div>

	<div class="group bg-card relative h-24 w-64 rounded-md border-2 hover:shadow-lg">
		<a href="/donate" rel="noopener nofollow" target="_blank" class="h-full w-full">
			<div class="flex h-full w-full flex-col items-center justify-center gap-1 px-4 py-2">
				<p class="leading-none">Support me on</p>
				<img src="/images/kofi_logo.webp" alt="Ko-Fi" class="h-10" />
			</div>
		</a>
		<div
			class="bg-card absolute -top-8 -right-[2px] hidden h-8 w-fit rounded-md border-2 px-2 transition-all duration-200 group-hover:block"
		>
			<span class="text-xs">
				Unlocks the <strong>Donator</strong> <a href="/info#Badges" class="text-link hover:underline">badge</a>!
			</span>
		</div>
	</div>

	<div
		class="border-border/50 bg-card relative h-24 w-64 rounded-md border-2 bg-cover hover:shadow-lg"
		style="background-image: url(/images/cherry.webp);"
	>
		<a href="/shop" class="h-full w-full">
			<div class="h-full w-full px-4 py-2">
				<p class="text-xl text-black">Cosmetics Shop</p>
			</div>
		</a>
	</div>
</div>

<style lang="css">
	.sticker-sprite {
		background-image: url(/images/allstickers.webp);
		background-size: 1000% 100%;

		animation-name: sprite-sheet-animation;
		animation-duration: 20s;
		animation-timing-function: steps(10, end);
		animation-iteration-count: infinite;
		background-position: 0% 100%;
	}

	@keyframes sprite-sheet-animation {
		from {
			background-position: 0% 100%;
		}
		to {
			background-position: -1000% 100%;
		}
	}
</style>
