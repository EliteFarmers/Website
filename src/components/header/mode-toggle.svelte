<script lang="ts">
	import PackIcon from '$comp/items/pack-icon.svelte';
	import { TEXTURE_PACKS } from '$lib/constants/packs';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getThemeContext, themes } from '$lib/stores/themes.svelte';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import Check from '@lucide/svelte/icons/check';
	import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';
	import PaintBrush from '@lucide/svelte/icons/paintbrush';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import ThemeOption from './theme-option.svelte';

	const currentTheme = getThemeContext();
	const gbl = getGlobalContext();

	let items = $derived(Object.entries(TEXTURE_PACKS).map(([id], i) => ({ id: i, pack: id })));

	function onconsider(e: CustomEvent<DndEvent<{ id: number; pack: string }>>) {
		items = e.detail.items;
	}

	function onfinalize(e: CustomEvent<DndEvent<{ id: number; pack: string }>>) {
		items = e.detail.items;
		gbl.packs = items.map((item, i) => ({
			id: item.pack,
			on: true, //gbl.packs.find((p) => p.id === item.pack)?.on ?? false,
			order: i,
		}));
		console.log('updating packs param', gbl.packsParam);
		gbl.updatePacksParam();
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({
				variant: 'ghost',
				class: 'px-1 py-0 text-base focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
			})
		)}
	>
		<PaintBrush class="block" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-screen md:w-fit">
		<div class="flex w-full flex-col items-start gap-2 p-2">
			<span class="py-1 text-lg font-semibold">Color Scheme</span>
			<div class="grid w-full grid-cols-1 gap-1 md:grid-cols-2">
				{#each themes as theme (theme.class)}
					<ThemeOption {theme} />
				{/each}
			</div>
			<button
				onclick={() => currentTheme.useSystem()}
				class="flex w-full cursor-pointer flex-row items-center justify-end"
			>
				<span class="text-muted-foreground underline">Use System Theme</span>
			</button>
			<div class="flex w-full flex-col items-center border-t pt-1">
				<span class="w-full py-1 text-left text-lg font-semibold">Texture Packs</span>
				<div class="flex w-full flex-col gap-1" use:dragHandleZone={{ items }} {onconsider} {onfinalize}>
					{#each items as item, i (item.id)}
						<!-- {@const packSetting = gbl.packs.find((p) => p.id === item.pack)} -->
						<div class="flex flex-row items-center justify-between rounded-md border p-1 px-2">
							<div class="flex w-full flex-row items-center gap-1">
								<div use:dragHandle class="cursor-move rounded-md p-2" aria-label="Drag to reorder">
									<GripHorizontal size={16} />
								</div>
								<a
									class="flex flex-1 flex-row items-center gap-1 hover:underline"
									href={TEXTURE_PACKS[item.pack].url}
									target="_blank"
									rel="noopener"
								>
									<PackIcon packId={item.pack} class="size-10 rounded-sm" />
									<div class="flex flex-col">
										<span class="font-medium">{TEXTURE_PACKS[item.pack].name}</span>
										<span class="text-muted-foreground text-sm"
											>by {TEXTURE_PACKS[item.pack].author}</span
										>
									</div>
								</a>
							</div>
							{#if i == 0}
								<span class="text-sm whitespace-nowrap"
									>Selected <Check class="inline-block size-4" /></span
								>
							{/if}
							<!-- <Switch
								onCheckedChange={(checked) => {
									const existingPack = packSetting;
									if (existingPack) {
										existingPack.on = checked;
										gbl.updatePacksParam();
									} else {
										gbl.packs = [
											...gbl.packs,
											{
												id: item.pack,
												on: checked,
												order: gbl.packs.length,
											},
										];
										gbl.updatePacksParam();
									}
								}}
								checked={packSetting?.on ?? false}
							/> -->
						</div>
					{/each}
				</div>
			</div>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
