<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import ToolStat from '$comp/tools/tool-stat.svelte';
	import * as Card from '$ui/card';
	import PlayerProfilePicker from '$comp/tools/player-profile-picker.svelte';
	import Faq from '$comp/faq.svelte';
	import * as Alert from '$ui/alert';
	import { Button } from '$ui/button';
	import { DatePicker } from '$ui/date-picker';
	import * as Popover from '$ui/popover';
	import * as Table from '$ui/table';
	import * as Tabs from '$ui/tabs';
	import { Walkthrough } from '$ui/walkthrough';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { BarChart, Tooltip } from 'layerchart';
	import { GainTracker, GEXP_PER_HOUR } from './gain-tracker.svelte';
	import { faqItems, walkthroughSteps } from './gain-content';

	const tracker = new GainTracker();
	tracker.connect(() => page.url);

	let walkthroughOpen = $state(false);
	const chartPadding = { left: 60, bottom: 24, top: 10, right: 10 };
	const chartTickLabelProps = { class: 'stroke-0! font-normal! text-xs md:text-sm' };
</script>

<Walkthrough bind:open={walkthroughOpen} steps={walkthroughSteps} padding={4} />

<ToolPage
	title="Crop Gain Tracker"
	description="Review daily collection, skill XP, and playtime across a nine-day window."
>
	{#snippet actions()}
		<Button variant="ghost" size="sm" onclick={() => (walkthroughOpen = true)}>
			<BookOpen class="size-4" aria-hidden="true" /> How to use
		</Button>
	{/snippet}

	<Card.Root class="gap-5 rounded-md border-2 p-4 shadow-none lg:grid lg:grid-cols-2">
		<h2 class="text-lg lg:col-span-2">Player and date range</h2>
		<div id="gain-player-search" class="min-w-0">
			<PlayerProfilePicker
				bind:playerUuid={tracker.playerUuid}
				bind:profileUuid={tracker.profileUuid}
				bind:playerName={tracker.playerName}
				bind:profileName={tracker.profileName}
				bind:profiles={tracker.profiles}
				bind:loading={tracker.loading}
				bind:error={tracker.error}
				onLoaded={tracker.fetchData}
				lookup={tracker.lookupPlayer}
			/>
		</div>

		<div id="gain-date-window" class="min-w-0 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
			<div class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<p class="text-sm font-semibold">Date window</p>
					<p class="text-xs text-muted-foreground">Choose the start of a fixed 9-day range.</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<Button
						aria-label="Previous nine-day window"
						variant="outline"
						size="icon"
						onclick={tracker.previousWindow}
						disabled={tracker.backDisabled}
					>
						<ArrowLeft class="h-4 w-4" aria-hidden="true" />
					</Button>
					<DatePicker
						bind:value={tracker.selectedStart}
						minValue={tracker.minDate}
						maxValue={tracker.maxStartDate}
						class="w-52"
					/>
					<Button
						aria-label="Next nine-day window"
						variant="outline"
						size="icon"
						onclick={tracker.nextWindow}
						disabled={tracker.forwardDisabled}
					>
						<ArrowRight class="h-4 w-4" aria-hidden="true" />
					</Button>
					<Button
						type="button"
						onclick={() => void tracker.fetchData()}
						disabled={!tracker.playerUuid || tracker.loading}>Update</Button
					>
				</div>

				<div class="text-left">
					<p class="text-xs text-muted-foreground">Selected window: {tracker.selectedRangeLabel}</p>
					{#if tracker.windowDirty}
						<p class="text-xs text-muted-foreground">Press Update to load this range.</p>
					{/if}
				</div>
			</div>
		</div>
	</Card.Root>

	{#if tracker.error && tracker.playerName}
		<Alert.Root variant="destructive">
			<Alert.Title
				>{tracker.cropDays.length || tracker.skillDays.length || tracker.uptimeDays.length
					? 'Partial results'
					: 'Could not load gain history'}</Alert.Title
			>
			<Alert.Description>{tracker.error}</Alert.Description>
		</Alert.Root>
	{/if}

	{#if tracker.loading}
		<div class="flex items-center gap-2 py-12">
			<Loader2 class="h-4 w-4 animate-spin" />
			<span class="text-sm text-muted-foreground">Loading...</span>
		</div>
	{:else if tracker.playerName}
		<p class="text-sm text-muted-foreground">
			Showing data for <strong>{tracker.playerName}</strong> ({tracker.profileName})
			{#if tracker.loadedRangeLabel}
				<span> &bull; {tracker.loadedRangeLabel}</span>
			{/if}
		</p>

		<Tabs.Root bind:value={tracker.activeTab} class="w-full" id="gain-tabs">
			<Tabs.List>
				<Tabs.Trigger value="crops">Crop Gains</Tabs.Trigger>
				<Tabs.Trigger value="skills">Skill XP</Tabs.Trigger>
				<Tabs.Trigger value="uptime">Uptime</Tabs.Trigger>
			</Tabs.List>

			<!-- CROP GAINS TAB -->
			<Tabs.Content value="crops">
				{#if tracker.cropDays.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">
						No crop collection data found for this window. This player may not have farmed recently or has
						Collections API disabled.
					</p>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<dl class="grid grid-cols-2 gap-4 border-y py-4">
							<ToolStat label="Total weight" value={tracker.totalWeight.toFixed(2)} />
							<ToolStat label="Daily average" value={tracker.avgWeight.toFixed(2) + ' / day'} />
						</dl>

						<div class="h-70 min-w-0 py-4">
							<BarChart
								data={tracker.cropChartData}
								x="label"
								y="value"
								height={248}
								yNice
								padding={chartPadding}
								tooltipContext={{ mode: 'band' }}
								props={{
									bars: { fill: 'var(--progress)', radius: 3 },
									xAxis: { tickLabelProps: chartTickLabelProps },
									yAxis: {
										format: (value: number) => tracker.formatCompact(+value),
										tickLabelProps: chartTickLabelProps,
									},
								}}
							>
								{#snippet tooltip({ context })}
									<Tooltip.Root {context} class="bg-card">
										{#snippet children({ data })}
											<Tooltip.Header>
												{tracker.tooltipFormatter.format(new Date(data.date * 1000))}
											</Tooltip.Header>
											<Tooltip.List>
												<Tooltip.Item label="Weight" value={data.value.toFixed(2)} />
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</BarChart>
						</div>

						<div class="overflow-hidden rounded-md border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Date</Table.Head>
										<Table.Head class="text-right">Weight</Table.Head>
										<Table.Head>Top Crops</Table.Head>
										<Table.Head class="w-10"></Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each [...tracker.cropDays].reverse() as day (day.date)}
										{@const crops = tracker.topCrops(day.crops)}
										{@const full = tracker.allCrops(day.crops)}
										{@const pests = tracker.allPests(day.pests)}
										<Table.Row>
											<Table.Cell class="font-mono text-sm">
												{day.dateLabel}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{day.weight.toFixed(2)}
											</Table.Cell>
											<Table.Cell>
												<div class="flex flex-wrap gap-2">
													{#if crops.length > 0}
														{#each crops as crop (crop.name)}
															<span
																class="flex items-center gap-1 text-xs text-muted-foreground"
															>
																{#if crop.img}
																	<img
																		src={crop.img}
																		alt={crop.name}
																		class="pixelated h-4 w-4"
																	/>
																{/if}
																{tracker.formatCompact(crop.amount)}
															</span>
														{/each}
														{#if full.length > 3}
															<span class="text-xs text-muted-foreground">
																+{full.length - 3} more
															</span>
														{/if}
													{:else}
														<span class="text-xs text-muted-foreground">
															No crops collected
														</span>
													{/if}
												</div>
											</Table.Cell>
											<Table.Cell>
												{#if full.length > 0}
													<Popover.Root>
														<Popover.Trigger>
															{#snippet child({ props })}
																<Button
																	{...props}
																	variant="ghost"
																	size="sm"
																	class="px-2">View</Button
																>
															{/snippet}
														</Popover.Trigger>
														<Popover.Content class="w-72">
															<div class="flex flex-col gap-3">
																<div>
																	<p class="mb-1 text-xs font-semibold">
																		All Crop Changes
																	</p>
																	<div class="flex flex-col gap-1">
																		{#each full as crop (crop.name)}
																			<div
																				class="flex items-center justify-between gap-2"
																			>
																				<span
																					class="flex items-center gap-1.5 text-xs"
																				>
																					{#if crop.img}
																						<img
																							src={crop.img}
																							alt={crop.name}
																							class="pixelated h-4 w-4"
																						/>
																					{/if}
																					{crop.name}
																				</span>
																				<span class="font-mono text-xs">
																					{crop.amount.toLocaleString()}
																				</span>
																			</div>
																		{/each}
																	</div>
																</div>
																{#if pests.length > 0}
																	<div>
																		<p class="mb-1 text-xs font-semibold">
																			Pest Kills
																		</p>
																		<div class="flex flex-col gap-1">
																			{#each pests as pest (pest.name)}
																				<div
																					class="flex items-center justify-between gap-2"
																				>
																					<span class="text-xs">
																						{pest.name}
																						<span
																							class="text-muted-foreground"
																							>({pest.cropName})</span
																						>
																					</span>
																					<span class="font-mono text-xs">
																						+{pest.amount.toLocaleString()}
																					</span>
																				</div>
																			{/each}
																		</div>
																	</div>
																{/if}
															</div>
														</Popover.Content>
													</Popover.Root>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				{/if}
			</Tabs.Content>

			<!-- SKILL XP TAB -->
			<Tabs.Content value="skills">
				{#if tracker.skillDays.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">
						No skill data available for this window.
					</p>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<dl class="grid grid-cols-2 gap-4 border-y py-4">
							<ToolStat label="Total XP" value={tracker.formatCompact(tracker.totalXp)} />
							<ToolStat label="Daily average" value={tracker.formatCompact(tracker.avgXp) + ' / day'} />
						</dl>

						<div class="h-70 min-w-0 py-4">
							<BarChart
								data={tracker.skillChartData}
								x="label"
								y="value"
								height={248}
								yNice
								padding={chartPadding}
								tooltipContext={{ mode: 'band' }}
								props={{
									bars: { fill: 'var(--primary)', radius: 3 },
									xAxis: { tickLabelProps: chartTickLabelProps },
									yAxis: {
										format: (value: number) => tracker.formatCompact(+value),
										tickLabelProps: chartTickLabelProps,
									},
								}}
							>
								{#snippet tooltip({ context })}
									<Tooltip.Root {context} class="bg-card text-foreground">
										{#snippet children({ data })}
											<Tooltip.Header>
												{tracker.tooltipFormatter.format(new Date(data.date * 1000))}
											</Tooltip.Header>
											<Tooltip.List>
												<Tooltip.Item label="XP" value={tracker.formatCompact(data.value)} />
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</BarChart>
						</div>

						<div class="overflow-hidden rounded-md border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Date</Table.Head>
										<Table.Head class="text-right">Total XP</Table.Head>
										<Table.Head>Top Skills</Table.Head>
										<Table.Head class="w-10"></Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each [...tracker.skillDays].reverse() as day (day.date)}
										{@const top = tracker.topSkills(day.skills)}
										{@const full = tracker.allSkills(day.skills)}
										<Table.Row>
											<Table.Cell class="font-mono text-sm">
												{day.dateLabel}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{tracker.formatCompact(day.totalXp)}
											</Table.Cell>
											<Table.Cell>
												<div class="flex flex-wrap gap-2">
													{#if top.length > 0}
														{#each top as skill (skill.name)}
															<span class="text-xs text-muted-foreground">
																{skill.name}: {tracker.formatCompact(skill.amount)}
															</span>
														{/each}
														{#if full.length > 3}
															<span class="text-xs text-muted-foreground">
																+{full.length - 3} more
															</span>
														{/if}
													{:else}
														<span class="text-xs text-muted-foreground">
															No skill XP gained
														</span>
													{/if}
												</div>
											</Table.Cell>
											<Table.Cell>
												{#if full.length > 0}
													<Popover.Root>
														<Popover.Trigger>
															<Button variant="ghost" size="sm" class="h-7 px-2 text-xs">
																View
															</Button>
														</Popover.Trigger>
														<Popover.Content class="w-64">
															<p class="mb-1 text-xs font-semibold">
																All Skill XP Changes
															</p>
															<div class="flex flex-col gap-1">
																{#each full as skill (skill.name)}
																	<div
																		class="flex items-center justify-between gap-2"
																	>
																		<span class="text-xs">{skill.name}</span>
																		<span class="font-mono text-xs">
																			{skill.amount.toLocaleString()}
																		</span>
																	</div>
																{/each}
															</div>
														</Popover.Content>
													</Popover.Root>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				{/if}
			</Tabs.Content>

			<!-- UPTIME TAB -->
			<Tabs.Content value="uptime">
				{#if tracker.uptimeDays.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">
						No guild exp history available for this window. This player may not be in a guild.
					</p>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<p class="text-xs text-muted-foreground">
							Estimated playtime based on Hypixel Guild EXP
							{#if tracker.guildName}
								in
								{#if tracker.guildId}
									<a
										href={resolve(`/guilds/${tracker.guildId}`)}
										class="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 hover:opacity-80"
									>
										{tracker.guildName}
										<ExternalLink class="inline h-3 w-3" />
									</a>
								{:else}
									<strong>{tracker.guildName}</strong>
								{/if}
							{/if}
							(~{GEXP_PER_HOUR.toLocaleString()} GEXP/hr)
						</p>

						<dl class="grid grid-cols-2 gap-4 border-y py-4">
							<ToolStat label="Total GEXP" value={tracker.totalGexp.toLocaleString()} />
							<ToolStat label="Daily average" value={tracker.formatCompact(tracker.avgGexp) + ' / day'} />
						</dl>

						<div class="h-70 min-w-0 py-4">
							<BarChart
								data={tracker.uptimeChartData}
								x="label"
								y="value"
								height={248}
								yNice
								padding={chartPadding}
								tooltipContext={{ mode: 'band' }}
								props={{
									bars: { fill: 'var(--primary)', radius: 3 },
									xAxis: { tickLabelProps: chartTickLabelProps },
									yAxis: {
										format: (value: number) => `${(+value).toFixed(1)}h`,
										tickLabelProps: chartTickLabelProps,
									},
								}}
							>
								{#snippet tooltip({ context })}
									<Tooltip.Root {context} class="bg-card">
										{#snippet children({ data })}
											<Tooltip.Header>
												{tracker.tooltipFormatter.format(new Date(data.date * 1000))}
											</Tooltip.Header>
											<Tooltip.List>
												<Tooltip.Item label="Hours" value={tracker.formatHours(data.value)} />
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</BarChart>
						</div>

						<div class="overflow-hidden rounded-md border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Date</Table.Head>
										<Table.Head class="text-right">GEXP</Table.Head>
										<Table.Head class="text-right">Est. Hours</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each [...tracker.uptimeDays].reverse() as day (day.date)}
										<Table.Row>
											<Table.Cell class="font-mono text-sm">
												{day.dateLabel}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{day.gexp.toLocaleString()}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{tracker.formatHours(day.hours)}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{/if}

	<!-- FAQ -->
	<Faq title="About gain tracking" items={faqItems} />
</ToolPage>
