<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import * as Select from '$ui/select';
	import SprayCan from '@lucide/svelte/icons/spray-can';
	import { Stat, STAT_NAMES, Vacuum } from 'farming-weight';

	interface Props {
		vacuums: Vacuum[];
		selected: Vacuum | undefined;
		onSelect: (id: string) => void;
		children?: import('svelte').Snippet;
	}

	let { vacuums, selected, onSelect, children }: Props = $props();

	const selectableVacuums = $derived(vacuums.filter((vacuum) => !!vacuum.item.uuid));
</script>

<section class="bg-card flex flex-col gap-4 rounded-lg border p-4 md:p-6">
	<header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<div class="bg-muted text-foreground flex size-10 items-center justify-center rounded-md">
				<SprayCan class="size-5" />
			</div>
			<div>
				<h2 class="text-xl leading-tight font-semibold">Vacuum</h2>
			</div>
		</div>

		{#if selectableVacuums.length > 0}
			<Select.Simple
				size="sm"
				class="sm:max-w-64"
				value={selected?.item.uuid}
				options={selectableVacuums.map((vacuum) => ({ value: vacuum.item.uuid ?? '', label: vacuum.name }))}
				placeholder="Select vacuum"
				change={(value?: string) => {
					if (value) onSelect(value);
				}}
			>
				{#snippet trigger(option)}
					{#if option}
						<FormattedText text={option.label} />
					{:else}
						<span>Select vacuum</span>
					{/if}
				{/snippet}
				{#snippet option(option)}
					<FormattedText text={option.label} />
				{/snippet}
			</Select.Simple>
		{/if}
	</header>

	{#if selected}
		<div class="bg-muted/30 flex flex-col gap-3 rounded-md p-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex min-w-0 items-center gap-3">
				<ItemRender skyblockId={selected.item.skyblockId ?? ''} class="size-12" />
				<div class="min-w-0 truncate text-lg font-semibold">
					<FormattedText text={selected.name} />
				</div>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<Lorebtn item={selected.item} />
				<FortuneBreakdown
					title="{STAT_NAMES[Stat.PestKillFortune]} Breakdown"
					stat={Stat.PestKillFortune}
					total={selected.getStat(Stat.PestKillFortune)}
					breakdown={selected.getStatBreakdown(Stat.PestKillFortune)}
					small
				/>
				<FortuneBreakdown
					title="{STAT_NAMES[Stat.Damage]} Breakdown"
					stat={Stat.Damage}
					total={selected.getStat(Stat.Damage)}
					breakdown={selected.getStatBreakdown(Stat.Damage)}
					small
				/>
			</div>
		</div>

		{@render children?.()}
	{:else if vacuums.length === 0}
		<div
			class="border-muted-foreground/30 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm"
		>
			No vacuum found on this profile.
		</div>
	{/if}
</section>
