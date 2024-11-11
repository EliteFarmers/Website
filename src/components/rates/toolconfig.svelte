<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer';
	import type { FarmingTool } from 'farming-weight';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import { slide } from 'svelte/transition';
	import { Edit } from 'lucide-svelte';

	interface Props {
		tool: FarmingTool;
		player: RatesPlayerStore;
	}

	let { tool, player }: Props = $props();

	const counterOptions = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000, 10_000_000_000];

	let expanded = $state(false);
	let reforge = $state(tool.reforge?.name.toLowerCase() ?? 'bountiful');

	let counter = $state(counterOptions.findLast((c) => c < tool.farmed) ?? 10_000);
</script>

<div class="flex flex-col gap-2 w-full rounded-md">
	<div class="flex justify-between items-center w-full">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span class="text-lg font-semibold">{@html FormatMinecraftText(tool.name ?? '')}</span>

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
		<div class="flex flex-col gap-2 items-start" transition:slide>
			<Label>Reforge</Label>
			<Select.Simple
				bind:value={reforge}
				options={[
					{ value: 'bountiful', label: 'Bountiful' },
					{ value: 'blessed', label: 'Blessed' },
				]}
				placeholder="Reforge"
				class="dark:bg-zinc-800"
				change={() => {
					tool.changeReforgeTo(reforge);
					player.refresh();
				}}
			/>
			<Label>Farmed Crops</Label>
			<Select.Simple
				bind:value={counter}
				placeholder="Farmed Crops"
				class="dark:bg-zinc-800"
				options={counterOptions.map((c) => ({
					value: c,
					label: c.toLocaleString(),
				}))}
				change={() => {
					tool.changeFarmedCropsTo(counter);
					player.refresh();
				}}
			/>
			<p class="text-gray-500 text-sm">More config options coming soon™!</p>
		</div>
	{/if}
</div>
