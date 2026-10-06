<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Countdown from '$comp/countdown.svelte';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import { getReadableSkyblockDate } from '$lib/format';
	import * as Select from '$ui/select';
	import CloudRain from '@lucide/svelte/icons/cloud-rain';
	import Flower2 from '@lucide/svelte/icons/flower-2';
	import { getWeatherForecast, WEATHER_ISLANDS, STAT_ICONS_UNICODE as STAT_ICONS, STAT_NAMES } from 'farming-weight';
	import { onMount } from 'svelte';
	import { createPreview } from './discord-preview';

	const island = $derived(
		WEATHER_ISLANDS.find((entry) => entry.id === page.url.searchParams.get('island')) ?? WEATHER_ISLANDS[0]
	);

	function selectIsland(id: string) {
		if (!id || id === page.url.searchParams.get('island')) return;
		void goto(`${resolve('/tools/weather')}?island=${encodeURIComponent(id)}`, { noScroll: true, keepFocus: true });
	}
	let seconds = $state(Math.floor(Date.now() / 1000));
	const weather = $derived(getWeatherForecast(seconds, 12));
	const windows = $derived(weather.current ? [weather.current, ...weather.upcoming] : weather.upcoming);

	onMount(() => {
		const interval = setInterval(() => {
			seconds = Math.floor(Date.now() / 1000);
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<ToolPage
	discordPreview={createPreview(island, weather)}
	title={`${island.name} Weather`}
	description="Weather forecasts and island bonuses."
>
	<div class="flex flex-wrap items-center gap-4">
		<Select.Root type="single" value={island.id} onValueChange={selectIsland}>
			<Select.Trigger aria-label="Island" class="w-full max-w-xs">{island.name}</Select.Trigger>
			<Select.Content>
				{#each WEATHER_ISLANDS as option (option.id)}
					<Select.Item value={option.id}>{option.name}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
	<div class="flex w-full flex-col gap-4">
		{#each windows as window (window.start)}
			{@const active = window.start <= seconds && seconds < window.end}
			{@const details = island[window.type]}
			{@const startDate = new Date(window.start * 1000)}
			{@const endDate = new Date(window.end * 1000)}
			<div
				class="flex w-full scroll-mt-32 flex-col items-center justify-between gap-4 rounded-md border-2 bg-card p-4 md:flex-row {active
					? 'border-active'
					: 'border-border'}"
				id={window.start.toString()}
			>
				<div class="flex min-w-0 flex-col items-center gap-2 text-center md:items-start md:text-left">
					<h2 class="text-2xl font-semibold">
						{active ? 'Active Weather' : getReadableSkyblockDate(window.start)}
					</h2>
					<p class="text-sm text-muted-foreground">
						{startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
						{startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
						- {endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
					</p>
					<div class="flex h-8 flex-row items-center gap-2">
						<Countdown
							start={window.start * 1000}
							end={window.end * 1000}
							class="gap-2 text-sm md:text-base"
						>
							{#snippet starting()}
								<p
									class="mb-0.5 text-sm leading-none whitespace-nowrap text-muted-foreground md:text-base"
								>
									Starts in
								</p>
							{/snippet}
							{#snippet ending()}
								<p
									class="mb-0.5 text-sm leading-none whitespace-nowrap text-muted-foreground md:text-base"
								>
									Ends in
								</p>
							{/snippet}
						</Countdown>
					</div>
				</div>
				<div class="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
					<h3 class="flex items-center gap-2 text-lg font-semibold">
						{#if island.id === 'garden' && window.type === 'extreme'}
							<Flower2 class="size-5 text-primary" />
						{:else if details.name.includes('Rain')}
							<CloudRain class="size-5 text-primary" />
						{/if}
						{details.name}
					</h3>
					<ul class="text-sm text-muted-foreground">
						{#each details.bonuses as bonus (bonus.stat)}
							<li>
								+{bonus.value} <span aria-hidden="true">{STAT_ICONS[bonus.stat]}</span>
								{STAT_NAMES[bonus.stat]}
							</li>
						{/each}
						{#if details.specialEffect}
							<li class="max-w-sm">{details.specialEffect}</li>
						{/if}
					</ul>
				</div>
			</div>
		{/each}
	</div>

	<p class="max-w-2xl text-sm text-muted-foreground">
		Weather lasts 20 minutes and starts every hour. All listed islands share the same schedule. Times are calculated
		from the SkyBlock calendar and shown in your local time zone.
	</p>
</ToolPage>
