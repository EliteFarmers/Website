<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import Edit from '@lucide/svelte/icons/edit';
	import type { FarmingTool } from 'farming-weight';
	import { slide } from 'svelte/transition';

	interface Props {
		tool: FarmingTool;
		player: RatesPlayerStore;
	}

	let { tool, player }: Props = $props();

	const counterOptions = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000, 10_000_000_000];

	let expanded = $state(false);
	let reforge = $state(tool.reforge?.name.toLowerCase() ?? 'bountiful');

	let counter = $state((counterOptions.findLast((c) => c < tool.farmed) ?? 10_000).toString());
</script>

<div class="flex w-full flex-col gap-2 rounded-md">
	<div class="flex w-full items-center justify-between">
		<span class="text-lg font-semibold"><FormattedText text={tool.name ?? ''} /></span>

		<div class="flex items-center gap-2">
			{#if tool.supportsCultivating()}
				<Button variant="ghost" size="sm" class="p-2" onclick={() => (expanded = !expanded)}>
					<Edit size={16} />
				</Button>
			{/if}

			<Lorebtn item={tool.item}>
				{#if tool.cultivating}
					<p>
						<span class="font-semibold select-none">Cultivating:</span>
						<span class="select-all">{tool.cultivating.toLocaleString()}</span>
					</p>
				{/if}
			</Lorebtn>

			<FortuneBreakdown total={tool.fortune} breakdown={tool.fortuneBreakdown} />
		</div>
	</div>
	{#if expanded}
		<div class="flex flex-col items-start gap-2" transition:slide>
			<Label>Reforge</Label>
			<Select.Simple
				bind:value={reforge}
				options={[
					{ value: 'bountiful', label: 'Bountiful' },
					{ value: 'blessed', label: 'Blessed' },
				]}
				placeholder="Reforge"
				change={(v) => {
					if (!v) return;
					tool.changeReforgeTo(reforge);
					$player.selectTool(tool);
					player.refresh();
				}}
			/>
			<Label>Farmed Crops</Label>
			<Select.Simple
				bind:value={counter}
				placeholder="Farmed Crops"
				options={counterOptions.map((c) => ({
					value: c.toString(),
					label: c.toLocaleString(),
				}))}
				change={(v) => {
					if (!v) return;
					tool.changeFarmedCropsTo(+counter);
					$player.selectTool(tool);
					player.refresh();
				}}
			/>
			<p class="text-muted-variant text-sm">More config options coming soon™!</p>
		</div>
	{/if}
</div>
