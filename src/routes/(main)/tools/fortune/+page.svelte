<script lang="ts">
	import Head from '$comp/head.svelte';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import FortuneDiffPanel from '$comp/tools/fortune/fortune-diff-panel.svelte';
	import FortuneResultPanel from '$comp/tools/fortune/fortune-result-panel.svelte';
	import FortuneShareControls from '$comp/tools/fortune/fortune-share-controls.svelte';
	import FortuneSideEditor from '$comp/tools/fortune/fortune-side-editor.svelte';
	import FortuneSideImport from '$comp/tools/fortune/fortune-side-import.svelte';
	import type { FortuneCompareFieldSection } from '$lib/calc/fortune-compare';
	import {
		defaultSideNames,
		farmingDurationOptions,
		linkSectionLabels,
		type SandboxMode,
	} from '$lib/calc/fortune-sandbox-helpers';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import * as Tabs from '$ui/tabs';
	import * as ToggleGroup from '$ui/toggle-group';
	import { Walkthrough } from '$ui/walkthrough';
	import type { PageData } from './$types';
	import { createFortuneSandboxState } from './fortune-sandbox-state.svelte';

	let { data }: { data: PageData } = $props();

	const sb = createFortuneSandboxState(() => data.shareId ?? undefined);

	type LinkSection = FortuneCompareFieldSection;

	interface WalkthroughSnippetContext {
		currentStepIndex: () => number;
		currentStep: () =>
			| {
					target: string;
					title: string;
					description: string;
					position?: 'top' | 'bottom' | 'left' | 'right';
			  }
			| undefined;
		isLastStep: () => boolean;
		next: () => void;
		prev: () => void;
		close: () => void;
	}

	const modeOptions: { value: SandboxMode; label: string }[] = [
		{ value: 'full', label: 'Full' },
		{ value: 'compare', label: 'Compare' },
	];

	function playerGearLine(source: { playerName: string; profileName?: string | null } | null | undefined) {
		if (!source) return null;
		return source.profileName ? `${source.playerName} (${source.profileName})` : source.playerName;
	}

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([{ name: 'Tools', href: '/tools' }, { name: 'Fortune Sandbox' }]);
	});
</script>

<Head title="Farming Fortune Sandbox | Elite" description="Configure your farming setup and see your rates!" />

<Walkthrough bind:open={sb.walkthroughOpen} steps={sb.walkthroughSteps} padding={4} onComplete={sb.completeWalkthrough}>
	{#snippet children(ctx)}
		{@const w = ctx as WalkthroughSnippetContext}
		<div class="bg-popover text-popover-foreground w-80 rounded-lg border p-4 shadow-xl sm:w-96">
			<div class="space-y-1">
				<p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Fortune Sandbox Guide</p>
				<h3 class="text-base leading-none font-semibold">{w.currentStep()?.title}</h3>
				<p class="text-muted-foreground text-sm">{w.currentStep()?.description}</p>
			</div>
			<div class="mt-4 flex items-center justify-between gap-3">
				<span class="text-muted-foreground text-xs">
					Step {w.currentStepIndex() + 1} / {sb.walkthroughSteps.length}
				</span>
				<div class="flex items-center gap-2">
					<Button variant="ghost" size="sm" onclick={w.close}>Close</Button>
					{#if w.currentStepIndex() > 0}
						<Button variant="outline" size="sm" onclick={() => w.prev()}>Back</Button>
					{/if}
					<Button size="sm" onclick={() => w.next()}>
						{w.isLastStep() ? 'Finish' : 'Next'}
					</Button>
				</div>
			</div>
		</div>
	{/snippet}
</Walkthrough>

<div class="flex w-full flex-col items-center gap-6 p-4">
	<!-- Header -->
	<div class="flex w-full max-w-6xl items-center justify-between gap-3">
		<div id="fortune-guide-hero" class="flex flex-col">
			<h1 class="text-3xl font-bold">Farming Fortune Sandbox</h1>
			<p class="text-muted-foreground">Experiment with different setups without being tied to a profile.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={sb.startWalkthrough}>How to Use</Button>
			<FortuneShareControls
				authorized={sb.gbl.authorized}
				loginRedirectHref={sb.getLoginRedirectHref()}
				compareMode={sb.compareMode}
				sideAPlayerGear={sb.sideA.playerGearSource}
				sideBPlayerGear={sb.sideB.playerGearSource}
				sideAName={sb.sideNameA}
				sideBName={sb.sideNameB}
				createSharePayload={sb.createSharePayload}
			/>
		</div>
	</div>

	<!-- Loaded shared setup info (single compact line) -->
	{#if sb.loadedSharedSetup}
		<p class="text-muted-foreground w-full max-w-6xl text-sm">
			Loaded shared setup: <span class="font-medium">{sb.loadedSharedSetup.name}</span>
			{#if sb.loadedSharedSetup.description}
				&mdash; {sb.loadedSharedSetup.description}
			{/if}
		</p>
	{/if}

	<!-- Player gear source (single compact line) -->
	{#if sb.sideA.playerGearSource || (sb.compareMode && sb.sideB.playerGearSource)}
		{@const gearLineA = playerGearLine(sb.sideA.playerGearSource)}
		{@const gearLineB = sb.compareMode ? playerGearLine(sb.sideB.playerGearSource) : null}
		<p class="text-muted-foreground w-full max-w-6xl text-sm">
			{#if sb.compareMode}
				{sb.sideNameA}: {gearLineA ?? 'manual setup'}
				&nbsp;|&nbsp;
				{sb.sideNameB}: {gearLineB ?? 'manual setup'}
			{:else}
				Using gear from {gearLineA}
			{/if}
		</p>
	{/if}

	<!-- Mode selector (segmented control) -->
	<section id="fortune-guide-mode" class="bg-card flex w-full max-w-6xl flex-col gap-3 rounded-lg border p-4">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 class="text-lg font-semibold">Mode</h2>
				<p class="text-muted-foreground text-sm">
					Full mode gives item-level control. Compare mode lets you test two setups side by side.
				</p>
			</div>
			<ToggleGroup.Root
				type="single"
				value={sb.mode}
				onValueChange={(value) => {
					if (value) sb.mode = value as SandboxMode;
				}}
				variant="outline"
			>
				{#each modeOptions as opt (opt.value)}
					<ToggleGroup.Item value={opt.value} class="px-5">{opt.label}</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
		</div>
	</section>

	<!-- Import player (non-compare) -->
	{#if !sb.compareMode}
		<section
			id="fortune-guide-import-player"
			class="bg-card flex w-full max-w-6xl flex-col gap-4 rounded-lg border p-4"
		>
			<div class="flex flex-col gap-1">
				<h2 class="text-lg font-semibold">Import from Player</h2>
				<p class="text-muted-foreground text-sm">
					Search for a player and load their farming pet, tool, armor, and equipment.
				</p>
			</div>
			<FortuneSideImport
				sideKey="A"
				sideName={sb.sideNameA}
				bind:state={sb.sideAImportState}
				loadPlayer={sb.loadPlayer}
				reloadSelectedProfile={sb.reloadSelectedProfile}
				showHeading={false}
			/>
		</section>
	{/if}

	{#if sb.importMessage}
		<p class="text-destructive text-sm">{sb.importMessage}</p>
	{/if}

	<!-- Crop selector -->
	<div id="fortune-guide-crop" class="w-full max-w-6xl">
		<CropSelector radio={true} />
	</div>

	<!-- Rate settings (improved labels) -->
	<section id="fortune-guide-assumptions" class="bg-card flex w-full max-w-6xl flex-col gap-4 rounded-lg border p-4">
		<div class="flex flex-col gap-1">
			<h2 class="text-lg font-semibold">Rate Settings</h2>
			<p class="text-muted-foreground text-sm">These scale all profit and collection outputs.</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<div class="flex flex-col gap-1">
				<span class="text-sm font-semibold">Farming Duration</span>
				<Select.Simple bind:value={sb.blocksBroken} options={farmingDurationOptions} />
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-sm font-semibold">BPS Efficiency</span>
				<p class="text-muted-foreground text-xs">
					{sb.bps.toFixed(1)} blocks/sec ({((sb.bps / 20) * 100).toFixed(0)}% of max)
				</p>
				<SliderSimple class="h-8" min={10} max={20} bind:value={sb.bps} step={0.05} />
			</div>
		</div>
		{#if sb.bazaarLoading}
			<p class="text-muted-foreground text-xs">Refreshing bazaar data...</p>
		{:else if sb.bazaarError}
			<p class="text-muted-foreground text-xs">{sb.bazaarError}</p>
		{/if}
	</section>

	<!-- Main content grid -->
	<div class="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-12">
		<!-- Config column -->
		<div
			id="fortune-guide-config-column"
			class="flex flex-col gap-6 {sb.compareMode ? 'lg:col-span-12' : 'lg:col-span-7'}"
		>
			{#if sb.compareMode}
				<!-- Compare config (Side A / Side B accordions) -->
				<Accordion.Root type="multiple" class="w-full space-y-4">
					<Accordion.Item value="A" class="rounded-lg border">
						<div id="fortune-guide-side-a-trigger">
							<Accordion.Trigger class="px-4 py-3 hover:no-underline">
								<div class="flex w-full items-center justify-between gap-4">
									<div class="flex flex-col text-left">
										<span class="text-lg font-semibold">{sb.sideNameA} Settings</span>
										<span class="text-muted-foreground text-xs">
											Pet: {sb.sideA.pet.info.name} | Tool: {sb.selectedToolA.info.name}
										</span>
									</div>
									<span class="text-sm font-semibold"
										>Fortune: {sb.sideAContext.effectiveFortune.toFixed(0)}</span
									>
								</div>
							</Accordion.Trigger>
						</div>
						<Accordion.Content class="px-4 pt-2 pb-4">
							<div class="mb-4 max-w-sm">
								<Label for="fortune-side-a-name">Side Name</Label>
								<Input
									id="fortune-side-a-name"
									class="mt-1"
									maxlength={64}
									placeholder={defaultSideNames.A}
									bind:value={sb.sideNames.A}
									onblur={() => {
										sb.sideNames.A = sb.getSideDisplayName('A');
									}}
								/>
							</div>
							<FortuneSideImport
								sideKey="A"
								sideName={sb.sideNameA}
								bind:state={sb.sideAImportState}
								loadPlayer={sb.loadPlayer}
								reloadSelectedProfile={sb.reloadSelectedProfile}
								class="mb-4"
							/>
							<FortuneSideEditor
								sideKey="A"
								bind:side={sb.sideA}
								selectedCropKey={sb.selectedCropKey}
								onSectionInteraction={sb.onSectionInteraction}
								createDefaultTool={sb.createDefaultTool}
							/>
						</Accordion.Content>
					</Accordion.Item>

					<Accordion.Item value="B" class="rounded-lg border">
						<div id="fortune-guide-side-b-trigger">
							<Accordion.Trigger class="px-4 py-3 hover:no-underline">
								<div class="flex w-full items-center justify-between gap-4">
									<div class="flex flex-col text-left">
										<span class="text-lg font-semibold">{sb.sideNameB} Settings</span>
										<span class="text-muted-foreground text-xs">
											Pet: {sb.sideB.pet.info.name} | Tool: {sb.selectedToolB.info.name}
										</span>
									</div>
									<span class="text-sm font-semibold"
										>Fortune: {sb.sideBContext.effectiveFortune.toFixed(0)}</span
									>
								</div>
							</Accordion.Trigger>
						</div>
						<Accordion.Content class="px-4 pt-2 pb-4">
							<div class="mb-4 max-w-sm">
								<Label for="fortune-side-b-name">Side Name</Label>
								<Input
									id="fortune-side-b-name"
									class="mt-1"
									maxlength={64}
									placeholder={defaultSideNames.B}
									bind:value={sb.sideNames.B}
									onblur={() => {
										sb.sideNames.B = sb.getSideDisplayName('B');
									}}
								/>
							</div>
							<FortuneSideImport
								sideKey="B"
								sideName={sb.sideNameB}
								bind:state={sb.sideBImportState}
								loadPlayer={sb.loadPlayer}
								reloadSelectedProfile={sb.reloadSelectedProfile}
								class="mb-4"
							/>
							<p class="text-muted-foreground mb-3 text-xs">
								Linked sections mirror {sb.sideNameA}. Unlink to edit independently.
							</p>
							<div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
								{#each Object.keys(sb.compareLinkedSections) as sectionKey (sectionKey)}
									{@const section = sectionKey as LinkSection}
									<div class="bg-muted/20 flex items-center justify-between rounded-md border p-3">
										<span class="text-sm font-medium">{linkSectionLabels[section]}</span>
										<div class="flex items-center gap-2">
											<span class="text-muted-foreground text-xs">Linked</span>
											<Switch
												checked={sb.compareLinkedSections[section]}
												onCheckedChange={(value) => sb.setSectionLinked(section, value)}
											/>
										</div>
									</div>
								{/each}
							</div>
							<FortuneSideEditor
								sideKey="B"
								bind:side={sb.sideB}
								selectedCropKey={sb.selectedCropKey}
								onSectionInteraction={sb.onSectionInteraction}
								createDefaultTool={sb.createDefaultTool}
							/>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			{:else}
				<!-- Full editor -->
				<div id="fortune-guide-advanced-panel">
					<FortuneSideEditor
						sideKey="A"
						bind:side={sb.sideA}
						selectedCropKey={sb.selectedCropKey}
						onSectionInteraction={sb.onSectionInteraction}
						createDefaultTool={sb.createDefaultTool}
					/>
				</div>
			{/if}
		</div>

		<!-- Results column -->
		<div
			id="fortune-guide-results-column"
			class="flex flex-col gap-6 {sb.compareMode ? 'lg:col-span-12' : 'lg:col-span-5'}"
		>
			{#if !sb.compareMode}
				<FortuneResultPanel
					title="{sb.selectedCrop} Results"
					context={sb.primaryContext}
					selectedCropKey={sb.selectedCropKey}
					showFortuneBreakdown={true}
				/>
			{:else}
				<!-- Desktop: side-by-side results -->
				<div class="hidden gap-4 md:grid md:grid-cols-2">
					<FortuneResultPanel
						title="{sb.sideNameA} - {sb.selectedCrop}"
						context={sb.sideAContext}
						selectedCropKey={sb.selectedCropKey}
						showFortuneBreakdown={true}
					/>
					<FortuneResultPanel
						title="{sb.sideNameB} - {sb.selectedCrop}"
						context={sb.sideBContext}
						selectedCropKey={sb.selectedCropKey}
						showFortuneBreakdown={true}
					/>
				</div>

				<!-- Mobile: tabbed results -->
				<div class="md:hidden">
					<Tabs.Root bind:value={sb.compareMobileTab} class="w-full">
						<Tabs.List class="w-full">
							<Tabs.Trigger value="A" class="flex-1">{sb.sideNameA}</Tabs.Trigger>
							<Tabs.Trigger value="B" class="flex-1">{sb.sideNameB}</Tabs.Trigger>
							<Tabs.Trigger value="diff" class="flex-1">Diff</Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="A" class="mt-4">
							<FortuneResultPanel
								title="{sb.sideNameA} - {sb.selectedCrop}"
								context={sb.sideAContext}
								selectedCropKey={sb.selectedCropKey}
								showFortuneBreakdown={true}
							/>
						</Tabs.Content>
						<Tabs.Content value="B" class="mt-4">
							<FortuneResultPanel
								title="{sb.sideNameB} - {sb.selectedCrop}"
								context={sb.sideBContext}
								selectedCropKey={sb.selectedCropKey}
								showFortuneBreakdown={true}
							/>
						</Tabs.Content>
						<Tabs.Content value="diff" class="mt-4">
							<p class="text-muted-foreground text-sm">
								See the diff panel below to compare {sb.sideNameA} vs {sb.sideNameB}.
							</p>
						</Tabs.Content>
					</Tabs.Root>
				</div>

				<!-- Diff / What-If panel -->
				<div id="fortune-guide-diff">
					<FortuneDiffPanel
						bind:diffMode={sb.diffMode}
						selectedCrop={sb.selectedCrop}
						sideNameA={sb.sideNameA}
						sideNameB={sb.sideNameB}
						compareSummaryRows={sb.compareSummaryRows}
						compareCoinSourceDiff={sb.compareCoinSourceDiff}
						compareCollectionSourceDiff={sb.compareCollectionSourceDiff}
						formatSigned={sb.formatSigned}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
