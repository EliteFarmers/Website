<script lang="ts">
	import FloatingButton from '$comp/floating-button.svelte';
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import CategoryProgress from '$comp/rates/category-progress.svelte';
	import PestGearSelector from '$comp/rates/pest/pest-gear-selector.svelte';
	import PestStatsSummary from '$comp/rates/pest/pest-stats-summary.svelte';
	import VacuumSelector from '$comp/rates/pest/vacuum-selector.svelte';
	import UpgradeList from '$comp/rates/upgrades/upgrade-list.svelte';
	import StatsHead from '$comp/seo/stats-head.svelte';
	import Cropselector from '$comp/stats/contests/crop-selector.svelte';
	import { trackAnalytics } from '$lib/analytics';
	import { getUpgradeCost } from '$lib/items';
	import { getRatesData } from '$lib/stores/ratesData';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { Skeleton } from '$ui/skeleton';
	import * as Tabs from '$ui/tabs';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Settings from '@lucide/svelte/icons/settings';
	import Sprout from '@lucide/svelte/icons/sprout';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { PEST_ARMOR_SLOTS, PEST_EQUIPMENT_SLOTS, PestFarmingPhase } from 'farming-weight';
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
	description="Track pest farming phases, shared equipment, vacuum progress, and phase-scoped upgrades for Hypixel SkyBlock farming."
	canonicalPath="/@{ctx.ign}/{encodeURIComponent(ctx.selectedProfile?.profileName ?? '')}/pest-farming"
/>

<FloatingButton onclick={openSettings} aria-label="Open pest farming settings">
	<Settings class="transition-all group-hover:rotate-90 md:size-6!" />
</FloatingButton>

{#if ctx.ready}
	{#if !hasGardenData}
		<div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
			<Sprout class="text-muted-foreground size-12" />
			<h1 class="text-2xl font-semibold md:text-3xl">No Garden Data</h1>
			<p class="text-muted-foreground max-w-md text-sm md:text-base">
				{ctx.ignMeta} hasn't visited the Garden on this profile yet. Pest farming stats become available once garden
				data is recorded.
			</p>
		</div>
	{:else}
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-2 py-4 md:gap-10 md:py-6">
			<section class="flex flex-col gap-4">
				<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
					<h1 class="text-3xl leading-tight font-semibold md:text-4xl">Pest Farming</h1>
					<Button variant="outline" size="sm" onclick={openSettings} class="self-start md:self-auto">
						<Settings class="size-4" />
						Settings
					</Button>
				</div>
				<Cropselector radio={true} analyticsEvent="pest_farming.crop_selected" />
			</section>

			<section class="bg-card flex flex-col gap-4 rounded-lg border p-4 md:p-6">
				<header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex flex-col gap-1">
						<h2 class="text-xl leading-tight font-semibold">{pest.selectedCropName} Fortune</h2>
					</div>
					<Fortunebreakdown
						title="{pest.selectedCropName} Fortune"
						stat={pest.cropContextStats[0]}
						total={pest.cropFortune.fortune}
						breakdown={pest.cropFortune.breakdown}
					/>
				</header>
				<PestStatsSummary entries={pest.cropContextSummary} />
				<CategoryProgress
					name="{pest.selectedCropName} Progress"
					progress={pest.cropProgress}
					items={pest.itemsData}
					costFn={getUpgradeCost}
					applyUpgrade={(upgrade) => pest.applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade)}
					expandUpgrade={(upgrade) => pest.expandPhaseUpgrade(PestFarmingPhase.Farm, upgrade)}
					getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
				/>
			</section>

			<PestGearSelector
				title="Shared Equipment"
				armorSet={pest.sharedEquipmentSet}
				slots={PEST_EQUIPMENT_SLOTS}
				selectPiece={(slot, uuid) => pest.selectSharedEquipment(slot, uuid)}
				clearPiece={(slot) => pest.clearSharedEquipment(slot)}
				getPieceBreakdown={(piece) => pest.getSharedEquipmentPieceBreakdown(piece)}
				getPieceScore={(piece) => pest.getSharedEquipmentPieceScore(piece)}
			>
				<CategoryProgress
					name="Shared Equipment Progress"
					progress={pest.sharedEquipmentProgress}
					items={pest.itemsData}
					costFn={getUpgradeCost}
					applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
					expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
					getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
				/>
			</PestGearSelector>

			<VacuumSelector
				vacuums={pest.vacuums}
				selected={pest.selectedVacuum}
				onSelect={(id) => pest.selectVacuum(id)}
			>
				<CategoryProgress
					name="Vacuum Upgrades"
					progress={pest.vacuumProgress}
					items={pest.itemsData}
					costFn={getUpgradeCost}
					applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
					expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
					getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
				/>
			</VacuumSelector>

			<section class="flex flex-col gap-5">
				<header
					class="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-16 z-20 -mx-2 flex flex-col gap-2 border-b px-2 py-3 backdrop-blur"
				>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div class="flex flex-col gap-1">
							<h2 class="text-2xl leading-tight font-semibold">{pest.activePhaseConfig.title}</h2>
							<p class="text-muted-foreground text-sm">{pest.activePhaseConfig.description}</p>
						</div>
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								class="h-12 w-12"
								onclick={openSettings}
								aria-label="Open pest farming settings"
							>
								<Settings class="size-4" />
							</Button>
							<Tabs.Root bind:value={pest.activePhase}>
								<div class="bg-muted/40 grid w-full grid-cols-3 gap-1 rounded-lg border p-1 sm:w-fit">
									{#each PHASE_CONFIG as config (config.phase)}
										<Tabs.Trigger
											value={config.phase}
											class="text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground rounded-md border border-transparent px-5 py-2 text-sm font-semibold transition-colors data-[state=active]:shadow-sm"
										>
											{config.label}
										</Tabs.Trigger>
									{/each}
								</div>
							</Tabs.Root>
						</div>
					</div>
				</header>

				<section class="bg-card flex flex-col gap-4 rounded-lg border p-4 md:p-6">
					<div class="grid gap-3 md:grid-cols-2">
						<!-- Armor set loadout card -->
						<div class="bg-muted/30 flex flex-col gap-2 rounded-md border p-3">
							<p class="text-muted-foreground text-xs leading-snug font-medium">Armor Set</p>
							<div class="grid grid-cols-2 gap-2">
								{#each pest.armorSetLoadouts as set (set.id)}
									<Button
										type="button"
										size="sm"
										variant={set.id === pest.activePhaseLoadout.armorSetId ? 'default' : 'outline'}
										class="min-w-0 justify-start"
										aria-pressed={set.id === pest.activePhaseLoadout.armorSetId}
										onclick={() => pest.selectPhaseArmorSet(pest.activePhase, set.id)}
									>
										<span class="truncate">{set.name}</span>
									</Button>
								{/each}
							</div>
						</div>

						<!-- Pet loadout card -->
						<div class="bg-muted/30 flex flex-col justify-center gap-2 rounded-md border p-3">
							{#if pest.pets.length > 0}
								<div class="flex items-center gap-2">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger
											class="hover:bg-muted/40 group focus-visible:ring-ring/50 flex flex-1 items-center gap-3 rounded-md p-1 text-left transition-colors outline-none focus-visible:ring-2"
											aria-label="Change pet"
										>
											{#if pest.activePhasePet}
												<ItemRender
													skyblockId={pest.activePhasePet.pet.type ?? ''}
													pet
													class="size-11 shrink-0"
												/>
											{:else}
												<div
													class="bg-card text-muted-foreground/60 flex size-11 shrink-0 items-center justify-center rounded-md border"
												>
													<CircleHelp class="size-5" />
												</div>
											{/if}
											<div class="min-w-0 flex-1">
												<p class="text-muted-foreground text-xs font-medium">Active Pet</p>
												<div class="truncate text-base font-semibold">
													{#if pest.activePhasePet}
														<FormattedText text={pest.activePhasePet.getFormattedName()} />
													{:else}
														<span class="text-muted-foreground">Select pet</span>
													{/if}
												</div>
											</div>
											<ChevronDown
												class="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
											/>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content
											class="max-h-96 min-w-(--bits-dropdown-menu-anchor-width) overflow-y-auto"
											align="start"
										>
											<DropdownMenu.Label
												>Pets ranked for {pest.activePhaseConfig.label.toLowerCase()} phase</DropdownMenu.Label
											>
											<DropdownMenu.Separator />
											<DropdownMenu.RadioGroup
												value={pest.activePhaseLoadout.petId ?? ''}
												onValueChange={(value) =>
													value && pest.selectPhasePet(pest.activePhase, value)}
											>
												{#each pest.pets
													.filter((pet) => !!pet.pet.uuid)
													.sort((a, b) => pest.getPetPhaseScore(b, pest.activePhase) - pest.getPetPhaseScore(a, pest.activePhase)) as pet, i (pet.pet.uuid ?? i)}
													<DropdownMenu.RadioItem value={pet.pet.uuid ?? ''}>
														<div class="flex flex-row items-center gap-2">
															<ItemRender
																skyblockId={pet.pet.type ?? ''}
																pet
																class="size-6"
															/>
															<FormattedText text={pet.getFormattedName()} />
														</div>
													</DropdownMenu.RadioItem>
												{/each}
											</DropdownMenu.RadioGroup>
										</DropdownMenu.Content>
									</DropdownMenu.Root>

									{#if pest.activePhasePet}
										<Fortunebreakdown
											title="{pest.activePhaseConfig.label} Pet Stats"
											breakdown={pest.getPetBreakdown(pest.activePhasePet, pest.activePhase)}
										/>
									{/if}
								</div>
							{:else}
								<div class="flex items-center gap-3 p-1">
									<div
										class="bg-card text-muted-foreground/60 flex size-11 shrink-0 items-center justify-center rounded-md border"
									>
										<CircleHelp class="size-5" />
									</div>
									<div class="min-w-0">
										<p class="text-muted-foreground text-xs font-medium">Active Pet</p>
										<p class="text-muted-foreground text-sm">No farming pets found.</p>
									</div>
								</div>
							{/if}
						</div>
					</div>

					{#if pest.activePhase === PestFarmingPhase.Kill}
						<div
							class="border-border/60 bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-md border border-dashed p-3 text-sm"
						>
							<CircleHelp class="size-4 shrink-0" />
							<span>Vacuum stats apply during the Kill phase, configure your vacuum above!</span>
						</div>
					{/if}

					<PestStatsSummary entries={pest.pestStats} />
				</section>

				{#if pest.activeArmorSet}
					<PestGearSelector
						title="Armor"
						armorSet={pest.activeArmorSet}
						slots={PEST_ARMOR_SLOTS}
						selectPiece={(slot, uuid) =>
							pest.selectArmorSetPiece(pest.activePhaseLoadout.armorSetId, slot, uuid)}
						clearPiece={(slot) => pest.clearArmorSetPiece(pest.activePhaseLoadout.armorSetId, slot)}
						getPieceBreakdown={(piece) => pest.getPhasePieceBreakdown(piece)}
						getPieceScore={(piece) => pest.getPhasePieceScore(piece)}
						blockedUuids={pest.armorSetConflictLabels}
					>
						{#snippet headerAction()}
							{#if pest.armorSetLoadouts.length > 1}
								<div class="flex gap-1.5">
									{#each pest.armorSetLoadouts as set (set.id)}
										<Button
											type="button"
											size="sm"
											variant={set.id === pest.activePhaseLoadout.armorSetId
												? 'default'
												: 'outline'}
											aria-pressed={set.id === pest.activePhaseLoadout.armorSetId}
											onclick={() => pest.selectPhaseArmorSet(pest.activePhase, set.id)}
										>
											<span class="truncate">{set.name}</span>
										</Button>
									{/each}
								</div>
							{/if}
						{/snippet}
						<CategoryProgress
							name="Armor Progress"
							progress={pest.activeArmorSetProgress}
							items={pest.itemsData}
							costFn={getUpgradeCost}
							applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
							expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
							getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
						/>
					</PestGearSelector>
				{/if}

				<section class="bg-card flex flex-col gap-3 rounded-lg border p-4 md:p-6">
					<header class="flex items-center justify-between gap-3">
						<h2 class="text-xl leading-tight font-semibold">{pest.activePhaseConfig.progress}</h2>
					</header>
					<CategoryProgress
						name=""
						progress={pest.activePhaseGeneralProgress}
						items={pest.itemsData}
						costFn={getUpgradeCost}
						applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
						expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
						getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
					/>
				</section>

				<section class="flex flex-col gap-4">
					<h2 class="text-2xl leading-tight font-semibold">Upgrades</h2>
					<div
						class="border-primary/30 bg-primary/5 text-foreground flex flex-col gap-2 rounded-lg border p-3 text-sm md:p-4"
					>
						<div class="flex items-start gap-2">
							<TriangleAlert class="text-primary mt-0.5 size-4 shrink-0" />
							<p>
								These upgrade suggestions are a work in progress. Please report any issues or feedback
								on our <a
									href="/support"
									class="text-link font-medium underline-offset-2 hover:underline">support server</a
								>.
							</p>
						</div>
					</div>
					{#if pest.activePhase === PestFarmingPhase.Spawn && pest.activePhaseLoadout.armorSetId === 'main'}
						<div
							class="mt-1 flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-sm"
						>
							<TriangleAlert class="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
							<p>
								You're viewing Spawn phase upgrades while equipped with your Farm/Kill armor. Upgrading
								this set for spawning may leave you worse off. Switch to your Spawn armor set before
								applying these upgrades.
							</p>
						</div>
					{/if}
					<UpgradeList
						upgrades={pest.activePhaseUpgrades}
						items={pest.itemsData}
						costFn={getUpgradeCost}
						applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
						expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
						hasUpgradePath={(upgrade) => pest.hasActivePhaseUpgradePath(upgrade)}
						costPerValueFn={(upgrade) => pest.getPhaseUpgradeScore(upgrade)}
						costPerHeader="Cost Per Phase Score"
						version={pest.pestVersion}
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
