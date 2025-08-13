<script lang="ts">
	import type { EventDetailsDto } from '$lib/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { EventType } from '$lib/utils';
	import * as Accordion from '$ui/accordion';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	interface Props {
		event: EventDetailsDto;
	}

	let { event }: Props = $props();

	const cropWeights = () => {
		const data = event.data as { cropWeights?: Record<string, number> } | undefined;
		return Object.entries(data?.cropWeights ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
	};

	const medalWeights = () => {
		const data = event.data as { medalWeights?: Record<string, number> } | undefined;
		return Object.entries(data?.medalWeights ?? {}).sort((a, b) => b[1] - a[1]);
	};

	const pestWeights = () => {
		const data = event.data as { pestWeights?: Record<string, number> } | undefined;
		return Object.entries(data?.pestWeights ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
	};

	const collectionWeights = () => {
		const data = event.data as { collectionWeights?: Record<string, { name: string; weight: number }> } | undefined;
		return Object.entries(data?.collectionWeights ?? {}).sort((a, b) => a[1].name.localeCompare(b[1].name));
	};
</script>

<Accordion.Root type="single">
	<Accordion.Item value="1">
		<Accordion.Trigger class="w-full">
			{#if event.type === EventType.FarmingWeight}
				<p>Show Crop Weights</p>
			{:else if event.type === EventType.Medals}
				<p>Show Medal Weights</p>
			{:else if event.type === EventType.Pests}
				<p>Show Pest Weights</p>
			{:else if event.type === EventType.Collections}
				<p>Show Collection Weights</p>
			{:else}
				<p>Show Event Weights</p>
			{/if}
		</Accordion.Trigger>
		<Accordion.Content>
			<div class="flex flex-col justify-between gap-1">
				{#if !event.data}
					<p>No event specific data found!</p>
				{/if}
				{#if event.type === EventType.FarmingWeight}
					{#each cropWeights() as [cropName, weight] (cropName)}
						{@const crop = getCropDisplayName(getCropFromName(cropName) ?? Crop.Wheat)}
						<div
							class="even:bg-background flex flex-row items-center justify-between gap-2 p-1 even:rounded-sm"
						>
							<div class="flex flex-row items-center gap-2">
								<img src={PROPER_CROP_TO_IMG[crop]} alt={crop} class="pixelated aspect-square" />
								<p class="font-semibold whitespace-nowrap">{crop}</p>
							</div>
							<p class="font-semibold">{weight.toLocaleString()}</p>
						</div>
					{/each}
				{:else if event.type === EventType.Medals}
					{#each medalWeights() as [medal, weight] (medal)}
						<div
							class="even:bg-background flex flex-row items-center justify-between gap-2 p-1 even:rounded-sm"
						>
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
				{:else if event.type === EventType.Pests}
					{#each pestWeights() as [pest, weight] (pest)}
						<div
							class="even:bg-background flex flex-row items-center justify-between gap-2 p-1 even:rounded-sm"
						>
							<div class="flex flex-row items-center gap-2">
								<img
									src="/images/pests/{pest.toLowerCase()}.png"
									alt={pest}
									class="pixelated aspect-square"
								/>
								<p class="font-semibold whitespace-nowrap">{pest}</p>
							</div>
							<p class="font-semibold">{weight.toLocaleString()}</p>
						</div>
					{/each}
				{:else if event.type === EventType.Collections}
					{#each collectionWeights() as [id, { name, weight }] (id)}
						<div
							class="even:bg-background flex flex-row items-center justify-between gap-2 p-1 even:rounded-sm"
						>
							<div class="flex flex-row items-center gap-2">
								<p class="font-semibold whitespace-nowrap">{name}</p>
							</div>
							<p class="font-semibold">{weight.toLocaleString()}</p>
						</div>
					{/each}
				{/if}
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
