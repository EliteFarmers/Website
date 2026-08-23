<script lang="ts">
	import { resolve } from '$app/paths';
	import FloatingButton from '$comp/floating-button.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import CategoryProgress from '$comp/rates/category-progress.svelte';
	import PestLoadoutCard from '$comp/rates/pest/pest-loadout-card.svelte';
	import PestRateBreakdown from '$comp/rates/pest/pest-rate-breakdown.svelte';
	import PestStatsSummary from '$comp/rates/pest/pest-stats-summary.svelte';
	import PestUpgradePhaseNav from '$comp/rates/pest/pest-upgrade-phase-nav.svelte';
	import UpgradeList from '$comp/rates/upgrades/upgrade-list.svelte';
	import StatsHead from '$comp/seo/stats-head.svelte';
	import Cropselector from '$comp/stats/contests/crop-selector.svelte';
	import { trackAnalytics } from '$lib/analytics';
	import { getUpgradeCost } from '$lib/items';
	import { getRatesData } from '$lib/stores/ratesData';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Skeleton } from '$ui/skeleton';
	import * as Tabs from '$ui/tabs';
	import Settings from '@lucide/svelte/icons/settings';
	import Sprout from '@lucide/svelte/icons/sprout';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { PestFarmingPhase } from 'farming-weight';
	import { PestFarmingPageContext, PHASE_CONFIG } from './pest-farming-context.svelte';
	import PestSettings from './pest-settings.svelte';

	const pest = new PestFarmingPageContext();
	const ctx = pest.ctx;
	const ratesData = getRatesData();

	const hasGardenData = $derived(!!ctx.member.current?.garden);

	function openSettings() {
		$ratesData.settings = true;
		trackAnalytics('pest_farming.settings_opened');
	}
</script>

<StatsHead
	title="Pest Farming"
	description="Track pest farming phases, loadouts, vacuum progress, and phase-scoped upgrades for Hypixel SkyBlock farming."
	canonicalPath="/@{ctx.ign}/{encodeURIComponent(ctx.selectedProfile?.profileName ?? '')}/pest-farming"
/>

<FloatingButton onclick={openSettings} aria-label="Open pest farming settings">
	<Settings class="transition-all group-hover:rotate-90 md:size-6!" />
</FloatingButton>

{#if ctx.ready}
	{#if !hasGardenData}
		<div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
			<Sprout class="size-12 text-muted-foreground" />
			<h1 class="text-2xl font-semibold md:text-3xl">No Garden Data</h1>
			<p class="max-w-md text-sm text-muted-foreground md:text-base">
				{ctx.ignMeta} hasn't visited the Garden on this profile yet. Pest farming stats become available once garden
				data is recorded.
			</p>
		</div>
	{:else}
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-2 py-4 md:gap-10 md:py-6">
			<section class="flex flex-col gap-4">
				<Cropselector radio={true} analyticsEvent="pest_farming.crop_selected" />
			</section>

			<PestRateBreakdown
				result={pest.pestRateResult}
				priceBook={pest.pestRatePriceBook}
				items={pest.itemsData}
				referenceOnlyPrices={ctx.isNonClassicProfile}
				{openSettings}
			/>

			<section class="pest-deferred-section flex flex-col gap-4 rounded-lg border bg-card p-4 md:p-6">
				<header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex flex-col gap-1">
						<h2 class="text-xl leading-tight font-semibold">
							{pest.selectedCropName} Fortune
						</h2>
					</div>
					<Fortunebreakdown
						title="{pest.selectedCropName} Fortune"
						stat={pest.cropContextStats[0]}
						total={pest.cropFortune.fortune}
						breakdown={pest.cropFortune.breakdown}
					/>
				</header>
				<PestStatsSummary entries={pest.cropContextSummary} compact />
				<CategoryProgress
					name="{pest.selectedCropName} Progress"
					progress={pest.cropProgress}
					items={pest.itemsData}
					costFn={getUpgradeCost}
					referenceOnlyPrices={ctx.isNonClassicProfile}
					applyUpgrade={(upgrade) => pest.applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade)}
					expandUpgrade={(upgrade) => pest.expandPhaseUpgrade(PestFarmingPhase.Farm, upgrade)}
					getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
				/>
			</section>

			<section class="pest-deferred-section pest-deferred-section--large flex flex-col gap-5">
				<header
					class="sticky top-16 z-20 -mx-2 flex flex-col gap-2 border-b bg-background/95 px-2 py-3 backdrop-blur supports-backdrop-filter:bg-background/80"
				>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div class="flex flex-col gap-1">
							<h2 class="text-2xl leading-tight font-semibold">{pest.activePhaseConfig.title}</h2>
							<p class="text-sm text-muted-foreground">{pest.activePhaseConfig.description}</p>
						</div>
						<div class="flex items-center gap-2">
							<Button variant="outline" size="sm" onclick={openSettings}>
								<Settings class="size-4" />
								Settings
							</Button>
							<Tabs.Root bind:value={pest.activePhase}>
								<div class="grid w-full grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1 sm:w-fit">
									{#each PHASE_CONFIG as config (config.phase)}
										<Tabs.Trigger
											value={config.phase}
											class="rounded-md border border-transparent px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
										>
											{config.label}
										</Tabs.Trigger>
									{/each}
								</div>
							</Tabs.Root>
						</div>
					</div>
				</header>

				<PestStatsSummary entries={pest.pestStats} compact />

				<PestLoadoutCard {pest} />

				<section class="flex flex-col gap-3 rounded-lg border bg-card p-4 md:p-6">
					<header class="flex items-center justify-between gap-3">
						<h2 class="text-xl leading-tight font-semibold">{pest.activePhaseConfig.progress}</h2>
					</header>
					<CategoryProgress
						name=""
						progress={pest.activePhaseGeneralProgress}
						items={pest.itemsData}
						costFn={getUpgradeCost}
						referenceOnlyPrices={ctx.isNonClassicProfile}
						applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
						expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
						getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
					/>
				</section>

				<section class="flex flex-col gap-4">
					<h2 class="text-2xl leading-tight font-semibold">{pest.activePhaseConfig.label} Upgrades</h2>
					<PestUpgradePhaseNav bind:phase={pest.activePhase} />
					<div class="flex items-start gap-2 text-sm text-muted-foreground">
						<TriangleAlert class="mt-0.5 size-4 shrink-0" />
						<p>
							These upgrade suggestions are a work in progress. Please report issues or feedback on our
							<a
								href={resolve('/support')}
								class="font-medium text-link underline-offset-2 hover:underline">support server</a
							>.
						</p>
					</div>
					<UpgradeList
						upgrades={pest.activePhaseUpgrades}
						items={pest.itemsData}
						costFn={getUpgradeCost}
						applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
						expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
						hasUpgradePath={(upgrade) => pest.hasActivePhaseUpgradePath(upgrade)}
						rateImpactFn={(upgrade) => pest.getPestRateImpact(upgrade)}
						rateImpactUnavailableLabel="Loading Rates"
						costPerValueFn={(upgrade) => pest.getPestRateImpactValue(upgrade) / 1000}
						costPerHeader="Cost / 1k Coins/hr"
						initialSorting={ctx.isNonClassicProfile ? [{ id: 'rateImpact', desc: true }] : undefined}
						referenceOnlyPrices={ctx.isNonClassicProfile}
						version={pest.pestRateVersion}
						pathVersion={pest.pestRatePathVersion}
					/>
				</section>
			</section>
		</div>

		<Dialog.Root bind:open={$ratesData.settings}>
			<Dialog.ScrollContent parentClass="max-w-2xl">
				<PestSettings {pest} />
			</Dialog.ScrollContent>
		</Dialog.Root>
	{/if}
{:else}
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 py-4 md:py-6">
		<Skeleton class="h-24 w-full" />
		<div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
			{#each [0, 1, 2, 3, 4] as i (i)}
				<Skeleton class="h-32 w-full" />
			{/each}
		</div>
		<Skeleton class="h-72 w-full" />
		<Skeleton class="h-72 w-full" />
		<Skeleton class="h-96 w-full" />
	</div>
{/if}

<style>
	.pest-deferred-section {
		content-visibility: auto;
		contain-intrinsic-size: auto 32rem;
	}

	.pest-deferred-section--large {
		contain-intrinsic-size: auto 100rem;
	}
</style>
