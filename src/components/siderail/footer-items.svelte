<script lang="ts">
	import { cn } from '$lib/utils';
	import { Separator } from '$ui/separator';
	import Question from '@lucide/svelte/icons/circle-question-mark';
	import { STORE_CODE } from '../../routes/(main)/gems/hypixel-store';
	import RailGroup from './rail-group.svelte';
	import RailItem from './rail-item.svelte';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<div
	class={cn(
		`mt-8 flex flex-col items-center justify-start gap-2 md:flex-row md:flex-wrap md:items-start md:justify-center md:gap-6 @max-7xl:mt-8`,
		className
	)}
>
	<div class="hidden w-full justify-end">
		<Separator class="mb-3 max-w-1/2" />
	</div>

	<RailGroup>
		<p class="font-semibold">Support The Site</p>
		<RailItem img="/images/farm-rat.png" name="View the Shop!" href="/shop" imgClass="object-bottom" />
	</RailGroup>

	<Separator class="mt-4 mb-2 w-full max-w-48 md:hidden" />

	<RailGroup>
		<div class="flex items-center justify-center gap-1">
			<p class="font-semibold">Unlock Badges</p>
			<a href="/info/badges" class="-mb-0.5 inline-block"><Question class="text-muted-foreground size-4" /> </a>
		</div>
		<RailItem
			img="/images/kofi_logo.webp"
			name="Donate!"
			href="/donate"
			target="_blank"
			imgClass="object-contain p-2"
		/>
	</RailGroup>

	<Separator class="mt-4 mb-2 w-full max-w-48 md:hidden" />

	<RailGroup>
		<p class="font-semibold">Buy Gems</p>

		<RailItem img="/images/creatorcode.webp" name="Use code {STORE_CODE.code}" href="/gems" imgClass="object-top">
			{#snippet absolute()}
				<div class="absolute top-[48%] left-[28%] text-sm font-semibold text-[#1ec64c]">
					{STORE_CODE.code}
				</div>
			{/snippet}
		</RailItem>
	</RailGroup>

	<div class="hidden w-full justify-end">
		<Separator class="my-4 max-w-1/2" />
	</div>
</div>
