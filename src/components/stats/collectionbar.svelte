<script lang="ts">
	import { page } from '$app/state';
	import * as Popover from '$comp/ui/popover';
	import * as Sidebar from '$ui/sidebar';
	import { getCropFromName } from 'farming-weight';
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

	let crop = $derived(name ? name : undefined);
	let cropEnum = $derived(crop ? getCropFromName(crop) : undefined);

	function getFrameStyle(rank: number) {
		if (rank <= 0) return '';

		if (rank <= 5) {
			return 'background-image: url(/images/frames/rainbow.png);';
		} else if (rank <= 10) {
			return 'background-image: url(/images/frames/mithril.png);';
		} else if (rank <= 50) {
			return 'background-image: url(/images/frames/gold.png);';
		} else if (rank <= 100) {
			return 'background-image: url(/images/frames/silver.png);';
		} else if (rank <= 500) {
			return 'background-image: url(/images/frames/bronze.png);';
		}
	}

	let style = $derived(getFrameStyle(rank));
	const sidebar = Sidebar.useSidebar();
</script>

{#if sidebar.size.tiny}
	<div class="bg-card flex max-h-30 w-full flex-row items-center gap-2 rounded-lg p-1 align-middle">
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
							class="bg-card hover:bg-muted rounded-md px-1.5"
						>
							<span class="xs:text-md text-sm sm:text-lg">#</span><span
								class="text-md xs:text-lg sm:text-xl">{rank}</span
							>
						</a>
					{/if}
					<p class="text-md font-semibold whitespace-nowrap sm:text-lg">{name}</p>
				</div>
				<p class="text-normal whitespace-nowrap sm:text-lg md:text-xl lg:text-2xl">
					{value.toLocaleString()}
				</p>
			</div>
			<div class="flex flex-row items-center gap-2">
				{#if pestRank > 0}
					<a
						href="/leaderboard/{pest}/{page.params.id}-{page.params.profile}"
						class="bg-card hover:bg-muted rounded-md px-1"
					>
						<span class="xs:text-md text-sm sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
							>{pestRank}</span
						>
					</a>
				{/if}
				<Popover.Mobile>
					{#snippet trigger()}
						<div class="flex h-6 flex-row items-center justify-center gap-2 align-middle">
							<p class="text-md font-semibold whitespace-nowrap sm:text-lg">
								{pestKills.toLocaleString()}
							</p>
						</div>
					{/snippet}
					<div class="flex max-w-md flex-col items-center gap-2">
						<p class="text-lg font-semibold first-letter:capitalize">{pest} Kills</p>
						<p>{pestKills.toLocaleString()}</p>
						<a
							class="text-link text-lg font-semibold hover:underline"
							href="/info/weight#pest-weight-adjustment">Weight Adjustment</a
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
			{#if cropEnum}
				<Minion name={name ?? ''} crop={cropEnum} tierField={minionTierField} size="sm" />
			{/if}
		</div>
	</div>
{:else}
	<div class="flex w-full flex-row items-center gap-2 align-middle">
		<div class="bg-card flex max-h-30 w-full flex-1 items-center justify-start gap-1 rounded-lg p-1 align-middle">
			{@render cropIcon('hidden sm:flex')}
			<div class="flex grow flex-col justify-center gap-1 pr-2">
				<div class="flex flex-row items-center justify-between gap-2">
					<div class="flex flex-row items-center gap-1">
						{@render cropIcon('flex sm:hidden')}
						{#if rank > 0}
							<a
								href="/leaderboard/{key}/{page.params.id}-{page.params.profile}"
								class="bg-card hover:bg-muted rounded-md px-1.5"
							>
								<span class="xs:text-md text-sm sm:text-lg">#</span><span
									class="text-md xs:text-lg sm:text-xl">{rank}</span
								>
							</a>
						{/if}
						<p class="text-md font-semibold whitespace-nowrap sm:text-lg">{name}</p>
					</div>
					<p class="text-right font-semibold sm:text-lg md:ml-2 md:text-xl lg:text-2xl">
						{weight.toLocaleString()}
					</p>
				</div>
				<div class="flex flex-row items-center justify-between gap-2 pb-0.5 md:pb-0">
					<p
						class="text-normal whitespace-nowrap {pestRank > 0
							? 'pl-1'
							: ''} sm:text-lg md:text-xl lg:text-2xl"
					>
						{value.toLocaleString()}
					</p>
					<div class="flex flex-row items-center gap-2">
						{#if pestRank > 0}
							<a
								href="/leaderboard/{pest}/{page.params.id}-{page.params.profile}"
								class="bg-card hover:bg-muted rounded-md px-1"
							>
								<span class="xs:text-md text-sm sm:text-lg">#</span><span
									class="text-md xs:text-lg sm:text-xl">{pestRank}</span
								>
							</a>
						{/if}
						<Popover.Mobile>
							{#snippet trigger()}
								<div class="flex h-6 flex-row items-center justify-center gap-2 align-middle">
									<p class="text-md font-semibold whitespace-nowrap sm:text-lg">
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
								<a
									class="text-link text-lg font-semibold hover:underline"
									href="/info/weight#pest-weight-adjustment">Weight Adjustment</a
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
		{#if cropEnum}
			<Minion name={name ?? ''} crop={cropEnum} tierField={minionTierField} />
		{/if}
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
	@reference '$css';

	.crop-container {
		@apply aspect-square justify-center object-contain align-middle;
		aspect-ratio: 1 / 1;
		background-repeat: no-repeat;
		background-size: 85%;
		background-position: center;
		background-blend-mode: color;
	}
</style>
