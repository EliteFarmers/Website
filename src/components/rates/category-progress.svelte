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
		children?: import('svelte').Snippet;
	}

	let { name, progress, items, costFn, applyUpgrade, expandUpgrade, equip, children }: Props = $props();

	let progressModal = $state(false);
	let shownProgressIndex = $state<number | null>(null);
	const shownProgress = $derived((shownProgressIndex !== null ? progress[shownProgressIndex] : null) ?? null);
	const equipConfig = $derived.by(() => (shownProgress && equip ? equip(shownProgress) : null));
</script>

<div class="flex flex-1 basis-64 flex-col justify-center gap-2">
	<div class="mx-1 flex w-full max-w-lg flex-1 flex-col gap-2">
		<div class="flex flex-row items-center gap-1">
			{@render children?.()}
			<h2 class="pl-1 text-xl">{name}</h2>
		</div>
		<div class="flex w-full max-w-lg flex-1 flex-col gap-1.5">
			{#each progress as p, i (p.name + p.fortune + (p.item?.uuid ?? ''))}
				{#if p.nextInfo || p.maxInfo || p.progress?.length || p.item || p.upgrades?.length}
					<button
						class="bg-card hover:bg-card/40 cursor-pointer rounded-md border px-1"
						onclick={() => {
							shownProgressIndex = i;
							progressModal = true;
						}}
					>
						<FortuneProgress progress={p} />
					</button>
				{:else}
					<div class="border border-transparent px-1">
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
	equipOptions={equipConfig?.options}
	equipValue={equipConfig?.value}
	equipPlaceholder={equipConfig?.placeholder}
	onEquipValueChange={equipConfig?.onChange}
/>
