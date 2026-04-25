<script lang="ts">
	import PackIcon from '$comp/items/pack-icon.svelte';
	import type { ResourcePackDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getTexturePacks } from '$lib/remote/textures.remote';
	import { getThemeContext, themes } from '$lib/stores/themes.svelte';
	import { mergeTexturePackCatalog } from '$lib/texture-packs';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import Check from '@lucide/svelte/icons/check';
	import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';
	import PaintBrush from '@lucide/svelte/icons/paintbrush';
	import Trash_2 from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import ThemeOption from './theme-option.svelte';

	const currentTheme = getThemeContext();
	const gbl = getGlobalContext();

	const packs = getTexturePacks();
	const availablePacks = $derived.by(() => mergeTexturePackCatalog(packs.current, gbl.localTexturePackOverrides));

	type PackItem = { id: string };
	type PackZone = 'enabled' | 'available';

	function comparePacks(a: ResourcePackDto, b: ResourcePackDto) {
		const packA = gbl.packs.find((p) => p.id === a.id);
		const packB = gbl.packs.find((p) => p.id === b.id);
		if (packA && packB) return packA.order - packB.order;
		if (packA) return -1;
		if (packB) return 1;
		return a.name.localeCompare(b.name);
	}

	function buildPackItems(enabled: boolean) {
		return [...availablePacks]
			.sort(comparePacks)
			.filter((pack) => (gbl.packs.find((p) => p.id === pack.id)?.on ?? false) === enabled)
			.map((pack) => ({ id: pack.id }));
	}

	let enabledItems = $state<PackItem[]>([]);
	let availableItems = $state<PackItem[]>([]);

	$effect(() => {
		enabledItems = buildPackItems(true);
		availableItems = buildPackItems(false);
	});

	function updateZone(zone: PackZone, items: PackItem[]) {
		if (zone === 'enabled') {
			enabledItems = items;
			return;
		}

		availableItems = items;
	}

	function syncPacks() {
		gbl.packs = [
			...enabledItems.map((item, order) => ({
				id: item.id,
				on: true,
				order,
			})),
			...availableItems.map((item, index) => ({
				id: item.id,
				on: false,
				order: enabledItems.length + index,
			})),
		];
	}

	function onconsider(zone: PackZone, e: CustomEvent<DndEvent<PackItem>>) {
		updateZone(zone, e.detail.items);
	}

	function onfinalize(zone: PackZone, e: CustomEvent<DndEvent<PackItem>>) {
		updateZone(zone, e.detail.items);
		syncPacks();
	}

	function isPreviewPack(packId: string) {
		return gbl.hasLocalTexturePackOverride(packId);
	}

	function removePreviewPack(packId: string) {
		gbl.removeLocalTexturePackOverride(packId);
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
		aria-label="Open theme settings"
		title="Open theme settings"
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
				{#if availablePacks.length}
					<div class="flex w-full flex-col gap-2">
						<div class="flex flex-col gap-1">
							<span class="text-muted-foreground text-sm"
								>Drag packs here to apply them. Higher packs take priority.</span
							>
							<div
								use:dragHandleZone={{
									items: enabledItems,
									morphDisabled: true,
									useCursorForDetection: true,
								}}
								onconsider={(e) => onconsider('enabled', e)}
								onfinalize={(e) => onfinalize('enabled', e)}
								class="flex min-h-16 flex-col gap-1 rounded-md border-2 border-dashed p-2"
							>
								{#each enabledItems as item, i (item.id)}
									{@const pack = availablePacks.find((p) => p.id === item.id)}
									<div class="flex flex-row items-center justify-between rounded-md border p-1 px-2">
										<div class="flex w-full flex-row items-center gap-1">
											{#if isPreviewPack(item.id)}
												<button
													type="button"
													class="text-destructive hover:text-destructive/80 inline-flex items-center gap-1 p-2 text-sm whitespace-nowrap"
													onclick={() => removePreviewPack(item.id)}
												>
													<Trash_2 class="size-4" />
												</button>
											{:else}
												<div
													use:dragHandle
													class="cursor-move rounded-md p-2"
													aria-label="Drag to reorder"
												>
													<GripHorizontal size={16} />
												</div>
											{/if}
											<a
												class="flex flex-1 flex-row items-center gap-1 hover:underline"
												href={pack?.downloadUrl}
												target="_blank"
												rel="noopener"
											>
												<PackIcon
													packId={item.id}
													packImg={pack?.iconDataUrl ?? undefined}
													class="size-10 rounded-sm"
												/>
												<div class="flex flex-col">
													<span class="font-medium">{pack?.name}</span>
													<span class="text-muted-foreground text-sm"
														>by {pack?.authors.join(', ')}</span
													>
												</div>
											</a>
										</div>
										<div class="ml-3 flex items-center gap-2">
											{#if i === 0}
												<span class="text-sm whitespace-nowrap"
													>Top Priority <Check class="inline-block size-4" /></span
												>
											{/if}
										</div>
									</div>
								{/each}
								{#if enabledItems.length === 0}
									<div
										class="text-muted-foreground flex min-h-12 max-w-sm items-center justify-center text-sm"
									>
										Drag packs from below to enable them!
									</div>
								{/if}
							</div>
						</div>

						<div class="flex flex-col gap-1 rounded-lg">
							<div class="flex flex-col">
								<span class="font-medium">Available Packs</span>
								<span class="text-muted-foreground text-sm"
									>Keep unused packs here until you want to enable them.</span
								>
							</div>
							<div
								use:dragHandleZone={{
									items: availableItems,
									morphDisabled: true,
									useCursorForDetection: true,
								}}
								onconsider={(e) => onconsider('available', e)}
								onfinalize={(e) => onfinalize('available', e)}
								class="flex min-h-16 w-full flex-wrap gap-1 rounded-md border-2 border-dashed p-2"
							>
								{#each availableItems as item (item.id)}
									{@const pack = availablePacks.find((p) => p.id === item.id)}
									<div class="flex flex-col items-center gap-1 rounded-md border p-1">
										<div class="flex flex-row items-center gap-1">
											<div
												use:dragHandle
												class="cursor-move rounded-md p-1"
												aria-label="Drag to enable {pack?.name ?? 'pack'}"
												title={pack?.name}
											>
												<PackIcon
													packId={item.id}
													packImg={pack?.iconDataUrl ?? undefined}
													class="size-10 rounded-sm"
												/>
											</div>
										</div>
										{#if isPreviewPack(item.id)}
											<button
												type="button"
												class="text-destructive hover:text-destructive/80 inline-flex items-center gap-1 px-1 text-xs"
												onclick={() => removePreviewPack(item.id)}
											>
												<X class="size-3" />
												Remove preview
											</button>
										{/if}
									</div>
								{/each}
								{#if availableItems.length === 0}
									<div
										class="text-muted-foreground flex min-h-12 items-center justify-center text-sm"
									>
										All loaded packs are enabled.
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
