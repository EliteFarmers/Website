<script lang="ts">
	import Countdown from '$comp/countdown.svelte';
	import type { HarvestFeastRotationDto, HarvestFeastRotationsDto, YearlyContestsDto } from '$lib/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getNextHarvestFeastWindow, selectHarvestFeastRotations } from '$lib/harvest-feast-rotations';
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import ChefHat from '@lucide/svelte/icons/chef-hat';
	import Ticket from '@lucide/svelte/icons/ticket';
	import { getCropDisplayName, getCropFromName } from 'farming-weight';
	import { onMount } from 'svelte';

	interface Props {
		contests?: YearlyContestsDto;
		harvestFeast?: HarvestFeastRotationsDto;
	}

	type JacobContest = {
		start: number;
		end: number;
		crops: string[];
		active: boolean;
	};

	type HarvestFeastEvent = {
		start: number;
		end: number;
		crops: string[];
		active: boolean;
		isGrandFeast?: boolean;
	};

	let { contests, harvestFeast }: Props = $props();
	let seconds = $state(Math.floor(Date.now() / 1000));

	function normalizeCrops(crops: string[]): string[] {
		return [
			...new Set(
				crops.map((crop) => {
					const normalized = getCropFromName(crop);
					return normalized === undefined ? crop : getCropDisplayName(normalized);
				})
			),
		].sort((a, b) => a.localeCompare(b));
	}

	function findJacobContest(now: number): JacobContest | null {
		const scheduled = Object.entries(contests?.contests ?? {}).sort(
			([left], [right]) => Number(left) - Number(right)
		);

		for (const [timestamp, crops] of scheduled) {
			const start = Number(timestamp);
			const end = start + 20 * 60;
			if (start < now && now <= end) {
				return { start, end, crops: normalizeCrops(crops), active: true };
			}
		}

		const next = scheduled.find(([timestamp]) => Number(timestamp) > now);
		if (!next) return null;

		const start = Number(next[0]);
		return {
			start,
			end: start + 20 * 60,
			crops: normalizeCrops(next[1]),
			active: false,
		};
	}

	function normalizeHarvestFeastRotation(
		rotation: HarvestFeastRotationDto | null,
		active: boolean
	): HarvestFeastEvent | null {
		if (!rotation) return null;
		return {
			start: Number(rotation.start),
			end: Number(rotation.end),
			crops: normalizeCrops(rotation.crops),
			active,
		};
	}

	const jacobContest = $derived(findJacobContest(seconds));
	const harvestFeastSelection = $derived(selectHarvestFeastRotations(harvestFeast, seconds));
	const harvestFeastEvent = $derived.by(() => {
		const current = normalizeHarvestFeastRotation(harvestFeastSelection.current, true);
		if (current) return current;

		const next = normalizeHarvestFeastRotation(harvestFeastSelection.upcoming[0] ?? null, false);
		if (next) return next;

		return {
			...getNextHarvestFeastWindow(seconds),
			crops: [],
			active: false,
			isGrandFeast: harvestFeastSelection.isGrandFeast,
		} satisfies HarvestFeastEvent;
	});
	const triggerLabel = $derived(
		[
			jacobContest
				? `${jacobContest.active ? 'Active' : 'Next'} Jacob's Contest: ${jacobContest.crops.join(', ')}`
				: null,
			harvestFeastEvent.active
				? `Active Harvest Feast: ${harvestFeastEvent.crops.join(', ')}`
				: harvestFeastEvent.crops.length > 0
					? `Next Harvest Feast: ${harvestFeastEvent.crops.join(', ')}`
					: 'Next Harvest Feast',
		]
			.filter(Boolean)
			.join('. ')
	);

	onMount(() => {
		const interval = setInterval(() => {
			seconds = Math.floor(Date.now() / 1000);
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

{#if jacobContest || harvestFeastEvent}
	<div class="hidden lg:block">
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						size="sm"
						class="h-9 gap-2 bg-card px-1.5 {!harvestFeastEvent.active && jacobContest?.active
							? 'border-destructive/50!'
							: ''}"
						aria-label={triggerLabel}
					>
						{#if jacobContest}
							<div
								class="flex items-center -space-x-1 rounded-sm border px-1 py-0.5 {harvestFeastEvent.active &&
								jacobContest.active
									? 'border-destructive/50'
									: 'border-transparent'}"
								aria-hidden="true"
							>
								<Ticket class="mr-1 size-4 text-primary" />
								{#each jacobContest.crops.slice(0, 3) as crop (crop)}
									{#if PROPER_CROP_TO_IMG[crop]}
										<img
											class="pixelated size-5 rounded-sm border border-background bg-card p-0.5"
											src={PROPER_CROP_TO_IMG[crop]}
											alt=""
										/>
									{/if}
								{/each}
							</div>
						{/if}
						{#if jacobContest && harvestFeastEvent.crops.length > 0}
							<div class="h-5 border-l" aria-hidden="true"></div>
						{/if}
						{#if harvestFeastEvent.crops.length > 0}
							<div
								class="flex items-center -space-x-1 rounded-sm border px-1 py-0.5 {harvestFeastEvent.active
									? 'border-destructive/50'
									: 'border-transparent'}"
								aria-hidden="true"
							>
								<ChefHat class="mr-1 size-4 text-primary" />
								{#each harvestFeastEvent.crops.slice(0, 4) as crop (crop)}
									{#if PROPER_CROP_TO_IMG[crop]}
										<img
											class="pixelated size-5 rounded-sm border border-background bg-card p-0.5"
											src={PROPER_CROP_TO_IMG[crop]}
											alt=""
										/>
									{/if}
								{/each}
							</div>
						{/if}
					</Button>
				{/snippet}
			</Popover.Trigger>

			<Popover.Content class="w-88 p-0" align="end" sideOffset={8}>
				<div class="border-b px-4 py-3">
					<p class="font-semibold">Farming events</p>
					<p class="text-xs text-muted-foreground">Current and upcoming crops</p>
				</div>

				<div class="flex flex-col gap-4 p-2">
					{#if jacobContest}
						<a
							href="/contests/upcoming"
							aria-labelledby="jacob-event-title"
							class="flex flex-col gap-3 rounded-md border p-3 {jacobContest.active
								? 'border-destructive'
								: 'border-transparent'}"
						>
							<div class="flex items-center gap-2">
								<Ticket class="size-4 text-primary" />
								<h2 id="jacob-event-title" class="text-sm font-semibold">
									{jacobContest.active ? "Jacob's Contest" : "Next Jacob's Contest"}
								</h2>
								<span class="ml-auto text-xs text-muted-foreground">
									{jacobContest.active ? 'Ends in' : 'Starts in'}
								</span>
								<Countdown
									start={jacobContest.start * 1000}
									end={jacobContest.end * 1000}
									class="w-20 text-xs"
								/>
							</div>
							{@render cropList(jacobContest.crops)}
						</a>
					{/if}

					<a
						href="/harvest-feast/upcoming"
						aria-labelledby="feast-event-title"
						class="flex flex-col gap-3 rounded-md border p-3 {harvestFeastEvent.active
							? 'border-destructive'
							: 'border-transparent'}"
					>
						<div class="flex items-center gap-2">
							<ChefHat class="size-4 text-primary" />
							<h2 id="feast-event-title" class="text-sm font-semibold">
								{#if harvestFeastEvent.isGrandFeast}
									{harvestFeastEvent.active
										? 'Grand Harvest Feast Crops'
										: 'Next Grand Harvest Feast'}
								{:else}
									{harvestFeastEvent.active ? 'Harvest Feast Crops' : 'Next Harvest Feast'}
								{/if}
							</h2>
							<span class="ml-auto text-xs text-muted-foreground">
								{harvestFeastEvent.active ? 'Ends in' : 'Starts in'}
							</span>
							<Countdown
								start={harvestFeastEvent.start * 1000}
								end={harvestFeastEvent.end * 1000}
								class="w-20 text-xs"
							/>
						</div>
						{#if harvestFeastEvent.crops.length > 0}
							{@render cropList(harvestFeastEvent.crops)}
						{:else}
							<p class="text-xs text-muted-foreground">Crops have not been reported yet.</p>
						{/if}
					</a>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>
{/if}

{#snippet cropList(crops: string[])}
	<div class="flex flex-wrap gap-2">
		{#each crops as crop (crop)}
			<div class="flex items-center gap-1.5 rounded-md bg-muted px-1 py-1 text-xs">
				{#if PROPER_CROP_TO_IMG[crop]}
					<img class="pixelated size-5" src={PROPER_CROP_TO_IMG[crop]} alt="" />
				{/if}
				<span>{crop}</span>
			</div>
		{/each}
	</div>
{/snippet}
