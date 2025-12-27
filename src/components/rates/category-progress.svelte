<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import type { FortuneSourceProgress, FortuneUpgrade, UpgradeInfo, UpgradeTreeNode } from 'farming-weight';
	import FortuneProgress from './fortune-progress.svelte';
	import ItemProgressDialog from './item-progress-dialog.svelte';

	interface Props {
		name: string;
		progress: FortuneSourceProgress[];
		items?: RatesItemPriceData;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
		expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
		equip?: (progress: FortuneSourceProgress) => {
			options: { value: string; label: string }[];
			value?: string;
			placeholder?: string;
			onChange: (value: string) => void;
		} | null;
		getUpgrades?: (progress: FortuneSourceProgress) => FortuneUpgrade[];
		children?: import('svelte').Snippet;
	}

	let { name, progress, items, costFn, applyUpgrade, expandUpgrade, equip, getUpgrades, children }: Props = $props();

	let progressModal = $state(false);
	let shownProgressIndex = $state<number | null>(null);
	const shownProgress = $derived((shownProgressIndex !== null ? progress[shownProgressIndex] : null) ?? null);
	const equipConfig = $derived.by(() => (shownProgress && equip ? equip(shownProgress) : null));
</script>

<div class="flex w-full flex-1 flex-col justify-center gap-2">
	<div class="mx-1 flex w-full flex-1 flex-col gap-2">
		<div class="flex flex-row items-center gap-1">
			{@render children?.()}
			<h2 class="pl-1 text-xl">{name}</h2>
		</div>
		<div class="grid w-full grid-cols-1 gap-1.5 md:grid-cols-2 lg:grid-cols-3">
			{#each progress as p, i (p.name + p.current + (p.item?.uuid ?? ''))}
				{#if p.nextInfo || p.maxInfo || p.progress?.length || p.item || p.upgrades?.length}
					<button
						class="bg-card hover:bg-card/40 w-full cursor-pointer rounded-md border px-1"
						onclick={() => {
							shownProgressIndex = i;
							progressModal = true;
						}}
					>
						<FortuneProgress progress={p} />
					</button>
				{:else}
					<div class="w-full border border-transparent px-1">
						<FortuneProgress progress={p} />
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<ItemProgressDialog
	bind:open={progressModal}
	progress={shownProgress}
	{items}
	{costFn}
	{applyUpgrade}
	{expandUpgrade}
	{getUpgrades}
	equipOptions={equipConfig?.options}
	equipValue={equipConfig?.value}
	equipPlaceholder={equipConfig?.placeholder}
	onEquipValueChange={equipConfig?.onChange}
/>
