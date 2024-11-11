<script lang="ts">
	import type { FortuneSourceProgress } from 'farming-weight';
	import FortuneProgress from './fortune-progress.svelte';
	import * as Dialog from '$ui/dialog';
	import ItemProgress from './item-progress.svelte';

	interface Props {
		name: string;
		progress: FortuneSourceProgress[];
		children?: import('svelte').Snippet;
	}

	let { name, progress, children }: Props = $props();

	let progressModal = $state(false);
	let shownProgress = $state<FortuneSourceProgress | undefined>(undefined);
</script>

<div class="flex flex-col gap-2 flex-1 basis-64 justify-center">
	<div class="flex flex-col max-w-lg w-full gap-2 flex-1 mx-1">
		<div class="flex flex-row gap-1 items-center">
			{@render children?.()}
			<h2 class="text-xl pl-1">{name}</h2>
		</div>
		<div class="flex flex-col max-w-lg w-full gap-1.5 flex-1">
			{#each progress as p (p.name + p.fortune + (p.item?.uuid ?? ''))}
				{#if p.nextInfo || p.maxInfo || p.progress?.length || p.item}
					<button
						class="hover:bg-primary-content/10 dark:hover:bg-card/50 px-1 rounded-lg cursor-pointer"
						onclick={() => {
							shownProgress = p;
							progressModal = true;
						}}
					>
						<FortuneProgress progress={p} />
					</button>
				{:else}
					<div class="px-1">
						<FortuneProgress progress={p} />
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<Dialog.Root bind:open={progressModal}>
	<Dialog.Content class="overflow-y-scroll max-h-[80%]">
		<Dialog.Title>{shownProgress?.name}</Dialog.Title>
		{#if shownProgress}
			<ItemProgress progress={shownProgress} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
