<script lang="ts">
	import type { FortuneSourceProgress } from 'farming-weight';
	import FortuneProgress from './fortune-progress.svelte';
	import * as Dialog from '$ui/dialog';
	import ItemProgress from './item-progress.svelte';

	export let name: string;
	export let progress: FortuneSourceProgress[];

	let progressModal = false;
	$: shownProgress = undefined as FortuneSourceProgress | undefined;
</script>

<div class="flex flex-col gap-2 flex-1 basis-64 justify-center">
	<div class="flex flex-col max-w-lg w-full gap-2 flex-1 mx-1">
		<div class="flex flex-row gap-1 items-center">
			<slot />
			<h2 class="text-xl pl-1">{name}</h2>
		</div>
		<div class="flex flex-col max-w-lg w-full gap-1.5 flex-1">
			{#each progress as p (p.name + p.fortune + (p.item?.uuid ?? ''))}
				{#if p.nextInfo || p.maxInfo || p.progress?.length || p.item}
					<button
						class="hover:bg-primary-content/10 dark:hover:bg-card/50 px-1 rounded-lg cursor-pointer"
						on:click={() => {
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
