<script lang="ts">
	import * as Accordion from '$ui/accordion';
	import type { components } from '$lib/api/api';
	import { EventType } from '$lib/utils';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	export let event: components['schemas']['EventDetailsDto'];

	const cropWeights = () => {
		const data = event.data as { cropWeights?: Record<string, number> } | undefined;
		return Object.entries(data?.cropWeights ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
	};

	const medalWeights = () => {
		const data = event.data as { medalWeights?: Record<string, number> } | undefined;
		return Object.entries(data?.medalWeights ?? {}).sort((a, b) => b[1] - a[1]);
	};
</script>

<Accordion.Root>
	<Accordion.Item value="1">
		<Accordion.Trigger class="w-full">
			{#if event.type === +EventType.FarmingWeight}
				<p>Show Crop Weights</p>
			{:else if event.type === +EventType.Medals}
				<p>Show Medal Weights</p>
			{:else}
				<p>Show Event Weights</p>
			{/if}
		</Accordion.Trigger>
		<Accordion.Content>
			<div class="flex flex-col gap-1 justify-between">
				{#if !event.data}
					<p>No event specific data found!</p>
				{/if}
				{#if event.type === +EventType.FarmingWeight}
					{#each cropWeights() as [cropName, weight]}
						{@const crop = getCropDisplayName(getCropFromName(cropName) ?? Crop.Wheat)}
						<div class="flex flex-row justify-between items-center gap-2 even:bg-card even:rounded-sm p-1">
							<div class="flex flex-row items-center gap-2">
								<img src={PROPER_CROP_TO_IMG[crop]} alt={crop} class="pixelated aspect-square" />
								<p class="font-semibold whitespace-nowrap">{crop}</p>
							</div>
							<p class="font-semibold">{weight.toLocaleString()}</p>
						</div>
					{/each}
				{:else if event.type === +EventType.Medals}
					{#each medalWeights() as [medal, weight]}
						<div class="flex flex-row justify-between items-center gap-2 even:bg-card even:rounded-sm p-1">
							<div class="flex flex-row items-center gap-2">
								<img
									src="/images/medals/{medal.toLowerCase()}.webp"
									alt={medal}
									class="pixelated aspect-square"
								/>
								<p class="font-semibold whitespace-nowrap">{medal}</p>
							</div>
							<p class="font-semibold">{weight.toLocaleString()}</p>
						</div>
					{/each}
				{/if}
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
