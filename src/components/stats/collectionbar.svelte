<script lang="ts">
	import { page } from '$app/state';
	import * as Popover from '$comp/ui/popover';
	import { PROPER_CROP_NAMES } from '$lib/constants/crops';
	import * as Sidebar from '$ui/sidebar';
	import Minion from './minion.svelte';

	interface Props {
		name: string | undefined;
		value: number;
		weight: number;
		pest: string;
		pestKills: number;
		pestRank?: number;
		uncounted?: number;
		minionTierField: number;
		key: string;
		rank?: number;
	}

	let {
		name,
		value,
		weight,
		pest,
		pestKills,
		pestRank = -1,
		uncounted = 0,
		minionTierField,
		key,
		rank = -1,
	}: Props = $props();

	const cropArray = PROPER_CROP_NAMES.sort((a, b) => a?.localeCompare(b ?? '') ?? 0);

	let crop = $derived(name ? name : undefined);
	let index = $derived(name && crop ? cropArray.indexOf(name) : -1);

	function getFrameStyle(rank: number) {
		if (rank <= 0) return '';

		if (rank <= 5) {
			return 'background-image: url(/images/frames/rainbow.webp);';
		} else if (rank <= 10) {
			return 'background-image: url(/images/frames/mithril.webp);';
		} else if (rank <= 50) {
			return 'background-image: url(/images/frames/gold.webp);';
		} else if (rank <= 100) {
			return 'background-image: url(/images/frames/silver.webp);';
		} else if (rank <= 500) {
			return 'background-image: url(/images/frames/bronze.webp);';
		}
	}

	let style = $derived(getFrameStyle(rank));
	const sidebar = Sidebar.useSidebar();
</script>

{#if sidebar.size.tiny}
	<div class="max-h-30 flex w-full flex-row items-center gap-2 rounded-lg bg-primary-foreground p-1 align-middle">
		<div class="flex flex-col items-center justify-evenly gap-1">
			{@render cropIcon()}
			<img
				src="/images/pests/{pest}.png"
				class="pixelated aspect-square size-8 h-full object-contain p-1"
				alt={pest}
			/>
		</div>
		<div class="flex flex-1 flex-col items-start justify-center gap-1">
			<div class="flex flex-col items-start">
				<div class="flex flex-row items-center gap-1">
					{#if rank > 0}
						<a
							href="/leaderboard/{key}/{page.params.id}-{page.params.profile}"
							class="rounded-md bg-card px-1.5 hover:bg-muted"
						>
							<span class="xs:text-md text-sm sm:text-lg">#</span><span
								class="text-md xs:text-lg sm:text-xl">{rank}</span
							>
						</a>
					{/if}
					<p class="text-md whitespace-nowrap font-semibold sm:text-lg">{name}</p>
				</div>
				<p class="text-normal whitespace-nowrap sm:text-lg md:text-xl lg:text-2xl">
					{value.toLocaleString()}
				</p>
			</div>
			<div class="flex flex-row items-center gap-2">
				{#if pestRank > 0}
					<a
						href="/leaderboard/{pest}/{page.params.id}-{page.params.profile}"
						class="rounded-md bg-card px-1 hover:bg-muted"
					>
						<span class="xs:text-md text-sm sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
							>{pestRank}</span
						>
					</a>
				{/if}
				<Popover.Mobile>
					{#snippet trigger()}
						<div class="flex h-6 flex-row items-center justify-center gap-2 align-middle">
							<p class="text-md whitespace-nowrap font-semibold sm:text-lg">
								{pestKills.toLocaleString()}
							</p>
						</div>
					{/snippet}
					<div class="flex max-w-md flex-col items-center gap-2">
						<p class="text-lg font-semibold first-letter:capitalize">{pest} Kills</p>
						<p>{pestKills.toLocaleString()}</p>
						<a class="text-lg font-semibold text-blue-500 hover:underline" href="/info#Pests"
							>Weight Adjustment</a
						>
						{#if uncounted === 0}
							<p>None!</p>
						{:else}
							<p>-{uncounted.toLocaleString()} {name}</p>
						{/if}
					</div>
				</Popover.Mobile>
			</div>
		</div>
		<div class="flex flex-col items-end justify-between gap-1">
			<p class="pr-1 text-right font-semibold sm:text-lg md:ml-2 md:text-xl lg:text-2xl">
				{Math.floor(weight).toLocaleString()}
			</p>
			<Minion name={name ?? ''} {index} tierField={minionTierField} size="sm" />
		</div>
	</div>
{:else}
	<div class="flex w-full flex-row items-center gap-2 align-middle">
		<div
			class="max-h-30 flex w-full flex-1 items-center justify-start gap-1 rounded-lg bg-primary-foreground p-1 align-middle"
		>
			{@render cropIcon('hidden sm:flex')}
			<div class="flex flex-grow flex-col justify-center gap-1 pr-2">
				<div class="flex flex-row items-center justify-between gap-2">
					<div class="flex flex-row items-center gap-1">
						{@render cropIcon('flex sm:hidden')}
						{#if rank > 0}
							<a
								href="/leaderboard/{key}/{page.params.id}-{page.params.profile}"
								class="rounded-md bg-card px-1.5 hover:bg-muted"
							>
								<span class="xs:text-md text-sm sm:text-lg">#</span><span
									class="text-md xs:text-lg sm:text-xl">{rank}</span
								>
							</a>
						{/if}
						<p class="text-md whitespace-nowrap font-semibold sm:text-lg">{name}</p>
					</div>
					<p class="text-right font-semibold sm:text-lg md:ml-2 md:text-xl lg:text-2xl">
						{weight.toLocaleString()}
					</p>
				</div>
				<div class="flex flex-row items-center justify-between gap-2 pb-0.5 md:pb-0">
					<p class="text-normal whitespace-nowrap pl-1 sm:text-lg md:text-xl lg:text-2xl">
						{value.toLocaleString()}
					</p>
					<div class="flex flex-row items-center gap-2">
						{#if pestRank > 0}
							<a
								href="/leaderboard/{pest}/{page.params.id}-{page.params.profile}"
								class="rounded-md bg-card px-1 hover:bg-muted"
							>
								<span class="xs:text-md text-sm sm:text-lg">#</span><span
									class="text-md xs:text-lg sm:text-xl">{pestRank}</span
								>
							</a>
						{/if}
						<Popover.Mobile>
							{#snippet trigger()}
								<div class="flex h-6 flex-row items-center justify-center gap-2 align-middle">
									<p class="text-md whitespace-nowrap font-semibold sm:text-lg">
										{pestKills.toLocaleString()}
									</p>
									<img
										src="/images/pests/{pest}.png"
										class="pixelated aspect-square h-full object-contain"
										alt={pest}
									/>
								</div>
							{/snippet}
							<div class="flex max-w-md flex-col items-center gap-2">
								<p class="text-lg font-semibold first-letter:capitalize">{pest} Kills</p>
								<p>{pestKills.toLocaleString()}</p>
								<a class="text-lg font-semibold text-blue-500 hover:underline" href="/info#Pests"
									>Weight Adjustment</a
								>
								{#if uncounted === 0}
									<p>None!</p>
								{:else}
									<p>-{uncounted.toLocaleString()} {name}</p>
								{/if}
							</div>
						</Popover.Mobile>
					</div>
				</div>
			</div>
		</div>
		<Minion name={name ?? ''} {index} tierField={minionTierField} />
	</div>
{/if}

{#snippet cropIcon(classes?: string)}
	<div class="crop-container pixelated flex aspect-square size-10 sm:size-14 md:size-20 {classes}" {style}>
		<img
			src="/images/crops/{key}.png"
			class="pixelated aspect-square rounded-lg object-contain p-[16%]"
			alt={name}
		/>
	</div>
{/snippet}

<style lang="postcss">
	.crop-container {
		@apply aspect-square justify-center object-contain align-middle;
		aspect-ratio: 1 / 1;
		background-repeat: no-repeat;
		background-size: 85%;
		background-position: center;
		background-blend-mode: color;
	}
</style>
