<script lang="ts">
	import * as Tabs from '$ui/tabs';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import { PestFarmingPhase } from 'farming-weight';

	let { phase = $bindable() }: { phase: PestFarmingPhase } = $props();

	const phases = [
		{ value: PestFarmingPhase.Farm, label: 'Farm' },
		{ value: PestFarmingPhase.Spawn, label: 'Spawn' },
		{ value: PestFarmingPhase.Kill, label: 'Kill' },
	] as const;
</script>

<div class="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 md:p-4">
	<div class="flex items-start gap-2.5">
		<ListChecks class="mt-0.5 size-5 shrink-0 text-primary" />
		<div class="flex flex-col gap-1">
			<p class="font-semibold text-foreground">Upgrades change by phase</p>
			<p class="text-sm text-muted-foreground">
				Farm, Spawn, and Kill use different stats and upgrade lists. Check each phase to see the best upgrades
				for that phase!
			</p>
		</div>
	</div>

	<div class="flex flex-col gap-1.5">
		<Tabs.Root bind:value={phase}>
			<div class="grid grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1">
				{#each phases as item (item.value)}
					<Tabs.Trigger
						value={item.value}
						class="rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
					>
						{item.label}
					</Tabs.Trigger>
				{/each}
			</div>
		</Tabs.Root>
	</div>
</div>
