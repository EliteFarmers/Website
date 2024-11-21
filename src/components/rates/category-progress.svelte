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

<div class="flex flex-1 basis-64 flex-col justify-center gap-2">
	<div class="mx-1 flex w-full max-w-lg flex-1 flex-col gap-2">
		<div class="flex flex-row items-center gap-1">
			{@render children?.()}
			<h2 class="pl-1 text-xl">{name}</h2>
		</div>
		<div class="flex w-full max-w-lg flex-1 flex-col gap-1.5">
			{#each progress as p (p.name + p.fortune + (p.item?.uuid ?? ''))}
				{#if p.nextInfo || p.maxInfo || p.progress?.length || p.item}
					<button
						class="cursor-pointer rounded-lg px-1 hover:bg-primary-content/10 dark:hover:bg-card/50"
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
	<Dialog.Content class="max-h-[80%] overflow-y-scroll">
		<Dialog.Title>{shownProgress?.name}</Dialog.Title>
		{#if shownProgress}
			<ItemProgress progress={shownProgress} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
