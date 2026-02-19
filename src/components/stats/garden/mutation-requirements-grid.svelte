<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import {
		GREENHOUSE_MUTATIONS,
		getGreenhouseMutationRenderItemId,
		getGreenhouseMutationRenderSurface,
	} from 'farming-weight';

	interface MutationSpreadCondition {
		readonly type: string;
		readonly crop?: string;
		readonly count?: number;
		readonly range?: string;
		readonly requirement?: string;
	}

	interface MutationData {
		readonly id: string;
		readonly growth: {
			readonly size: readonly number[];
			readonly surface: string;
		};
		readonly spreadingConditions?: readonly MutationSpreadCondition[];
	}

	interface MutationReference {
		readonly id: string;
		readonly growth: {
			readonly size: readonly number[];
			readonly surface: string;
		};
	}

	interface GridPosition {
		x: number;
		y: number;
	}

	interface Rect {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface GridCell {
		blockName?: string;
		overlayItem?: string;
		mutationId?: string;
		isTarget?: boolean;
	}

	interface SpreadInstance extends Rect {
		overlayItem: string;
		surface: string;
		mutationId?: string;
		consumedSlots: GridPosition[];
	}

	interface GridOverlay extends Rect {
		key: string;
		skyblockId: string;
		mutationId?: string;
	}

	interface SlotAssignment {
		slot: GridPosition;
		slotIndex: number;
		crop: string;
		overlayItem: string;
		surface: string;
		mutationId?: string;
		width: number;
		height: number;
		consumedByLarge?: boolean;
	}

	interface LargeGroupPlan {
		crop: string;
		overlayItem: string;
		surface: string;
		mutationId?: string;
		width: number;
		height: number;
		slots: GridPosition[];
		centerX: number;
		centerY: number;
	}

	interface Props {
		mutation: MutationData;
		onMutationSelect?: (mutationId: string) => void;
	}

	let { mutation, onMutationSelect }: Props = $props();

	const gbl = getGlobalContext();

	function normalizeMutationName(value: string): string {
		return value.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');
	}

	function clampDimension(value?: number): number {
		return Math.max(1, Math.floor(value ?? 1));
	}

	function getOverlayItemClass(width: number, height: number): string {
		const largestDimension = Math.max(width, height);
		if (largestDimension >= 3) return 'size-14 sm:size-16 md:size-24';
		if (largestDimension === 2) return 'size-10 sm:size-12 md:size-16';
		return 'size-8 sm:size-10 md:size-12';
	}

	function buildRingSlots(targetWidth: number, targetHeight: number): GridPosition[] {
		const slots: GridPosition[] = [];

		for (let x = -1; x <= targetWidth; x++) {
			slots.push({ x, y: -1 });
		}

		for (let y = 0; y <= targetHeight; y++) {
			slots.push({ x: targetWidth, y });
		}

		for (let x = targetWidth - 1; x >= -1; x--) {
			slots.push({ x, y: targetHeight });
		}

		for (let y = targetHeight - 1; y >= 0; y--) {
			slots.push({ x: -1, y });
		}

		return slots;
	}

	function slotKey(slot: GridPosition): string {
		return `${slot.x}:${slot.y}`;
	}

	function isSlotInsideRect(slot: GridPosition, rect: Rect): boolean {
		return slot.x >= rect.x && slot.x < rect.x + rect.width && slot.y >= rect.y && slot.y < rect.y + rect.height;
	}

	function rectsOverlap(a: Rect, b: Rect): boolean {
		return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
	}

	function rectOverlapsTarget(rect: Rect, targetWidth: number, targetHeight: number): boolean {
		return !(
			rect.x + rect.width <= 0 ||
			rect.y + rect.height <= 0 ||
			rect.x >= targetWidth ||
			rect.y >= targetHeight
		);
	}

	function getInitialRingSlotIndex(ringSlots: readonly GridPosition[], targetWidth: number): number {
		if (!ringSlots.length) return 0;

		const targetCenterX = (targetWidth - 1) / 2;
		let bestIndex = 0;
		let bestScore = Number.POSITIVE_INFINITY;

		for (const [idx, slot] of ringSlots.entries()) {
			if (slot.y !== -1) continue;
			const score = Math.abs(slot.x - targetCenterX);
			if (score >= bestScore) continue;
			bestScore = score;
			bestIndex = idx;
		}

		return bestIndex;
	}

	function splitBlocksAcrossInstances(totalBlocks: number, maxPerInstance: number): number[] {
		const safeTotal = Math.max(1, Math.floor(totalBlocks));
		const safeMax = Math.max(1, Math.floor(maxPerInstance));
		const instanceCount = Math.max(1, Math.ceil(safeTotal / safeMax));
		const base = Math.floor(safeTotal / instanceCount);
		let remainder = safeTotal % instanceCount;

		return Array.from({ length: instanceCount }, () => {
			const value = base + (remainder > 0 ? 1 : 0);
			remainder = Math.max(0, remainder - 1);
			return value;
		});
	}

	const mutationLookup = Object.values(GREENHOUSE_MUTATIONS).reduce<Record<string, MutationReference>>(
		(acc, entry) => {
			const mutationEntry = entry as MutationReference;
			acc[normalizeMutationName(mutationEntry.id)] = mutationEntry;
			return acc;
		},
		{}
	);

	function getMutationFootprint(cropId: string): {
		width: number;
		height: number;
		mutationId?: string;
		surface?: string;
	} {
		const linkedMutation = mutationLookup[normalizeMutationName(cropId)];
		if (!linkedMutation) {
			return { width: 1, height: 1 };
		}

		const [width = 1, height = 1] = linkedMutation.growth.size;
		return {
			width: clampDimension(width),
			height: clampDimension(height),
			mutationId: linkedMutation.id,
			surface: linkedMutation.growth.surface,
		};
	}

	function selectMutation(mutationId?: string) {
		if (!mutationId) return;
		onMutationSelect?.(mutationId);
	}

	function buildSlotAssignments(ringSlots: readonly GridPosition[], startIndex: number): SlotAssignment[] | null {
		const assignments: SlotAssignment[] = [];
		const usedRingIndices = new SvelteSet<number>();
		let cursor = startIndex;

		for (const condition of mutation.spreadingConditions ?? []) {
			if (condition.type !== 'CROP' || !condition.crop) continue;

			const blockCount = Math.max(1, Math.floor(condition.count ?? 1));
			const footprint = getMutationFootprint(condition.crop);
			const overlayItem = getGreenhouseMutationRenderItemId(condition.crop);
			const surface = getGreenhouseMutationRenderSurface(
				condition.crop,
				footprint.surface ?? mutation.growth.surface
			);

			for (let i = 0; i < blockCount; i++) {
				let slotIndex = -1;
				for (let attempt = 0; attempt < ringSlots.length; attempt++) {
					const nextIndex = (cursor + attempt) % ringSlots.length;
					if (usedRingIndices.has(nextIndex)) continue;
					slotIndex = nextIndex;
					break;
				}

				if (slotIndex < 0) {
					return null;
				}

				usedRingIndices.add(slotIndex);
				cursor = slotIndex + 1;

				assignments.push({
					slot: ringSlots[slotIndex],
					slotIndex,
					crop: condition.crop,
					overlayItem,
					surface,
					mutationId: footprint.mutationId,
					width: footprint.width,
					height: footprint.height,
				});
			}
		}

		return assignments;
	}

	function buildLargeGroupPlans(assignments: readonly SlotAssignment[]): LargeGroupPlan[] {
		const assignmentsByCrop = new SvelteMap<string, SlotAssignment[]>();

		for (const assignment of assignments) {
			const list = assignmentsByCrop.get(assignment.crop);
			if (list) {
				list.push(assignment);
			} else {
				assignmentsByCrop.set(assignment.crop, [assignment]);
			}
		}

		const groups: LargeGroupPlan[] = [];
		for (const [crop, cropAssignments] of assignmentsByCrop.entries()) {
			const seed = cropAssignments[0];
			if (!seed || (seed.width === 1 && seed.height === 1)) continue;

			const blocksByInstance = splitBlocksAcrossInstances(
				cropAssignments.length,
				Math.max(seed.width, seed.height)
			);
			let offset = 0;

			for (const blockCount of blocksByInstance) {
				const groupAssignments = cropAssignments.slice(offset, offset + blockCount);
				offset += blockCount;
				if (!groupAssignments.length) continue;

				const slots = groupAssignments.map((assignment) => assignment.slot);
				const centerX = slots.reduce((sum, slot) => sum + slot.x, 0) / slots.length;
				const centerY = slots.reduce((sum, slot) => sum + slot.y, 0) / slots.length;

				groups.push({
					crop,
					overlayItem: seed.overlayItem,
					surface: seed.surface,
					mutationId: seed.mutationId,
					width: seed.width,
					height: seed.height,
					slots,
					centerX,
					centerY,
				});
			}
		}

		return groups.sort(
			(a, b) =>
				b.width * b.height - a.width * a.height ||
				b.slots.length - a.slots.length ||
				a.crop.localeCompare(b.crop)
		);
	}

	function findLargePlacement(
		group: LargeGroupPlan,
		ringSlots: readonly GridPosition[],
		placedRects: readonly Rect[],
		targetWidth: number,
		targetHeight: number
	): Rect | undefined {
		const groupSlotKeys = new SvelteSet(group.slots.map((slot) => slotKey(slot)));
		let bestRect: Rect | undefined;
		let bestScore = Number.POSITIVE_INFINITY;

		for (let x = -group.width; x <= targetWidth; x++) {
			for (let y = -group.height; y <= targetHeight; y++) {
				const rect: Rect = { x, y, width: group.width, height: group.height };

				if (rectOverlapsTarget(rect, targetWidth, targetHeight)) continue;
				if (placedRects.some((placed) => rectsOverlap(rect, placed))) continue;
				if (group.slots.some((slot) => !isSlotInsideRect(slot, rect))) continue;

				const ringSlotsInside = ringSlots.filter((slot) => isSlotInsideRect(slot, rect));
				if (ringSlotsInside.length !== group.slots.length) continue;
				if (ringSlotsInside.some((slot) => !groupSlotKeys.has(slotKey(slot)))) continue;

				const rectCenterX = rect.x + (rect.width - 1) / 2;
				const rectCenterY = rect.y + (rect.height - 1) / 2;
				const distanceScore = Math.abs(rectCenterX - group.centerX) + Math.abs(rectCenterY - group.centerY);
				const tieBreaker = y * 100 + x;
				const score = distanceScore * 1000 + tieBreaker;

				if (score >= bestScore) continue;
				bestScore = score;
				bestRect = rect;
			}
		}

		return bestRect;
	}

	let size = $derived.by(() => {
		const [width = 1, height = 1] = mutation.growth?.size ?? [1, 1];
		return {
			width: clampDimension(width),
			height: clampDimension(height),
		};
	});

	let spreadPlan = $derived.by(() => {
		const ringSlots = buildRingSlots(size.width, size.height);
		if (!ringSlots.length) {
			return {
				slotAssignments: [] as SlotAssignment[],
				largeInstances: [] as SpreadInstance[],
			};
		}

		const initialSlotIndex = getInitialRingSlotIndex(ringSlots, size.width);

		for (let rotation = 0; rotation < ringSlots.length; rotation++) {
			const slotAssignments = buildSlotAssignments(ringSlots, initialSlotIndex + rotation);
			if (!slotAssignments) continue;

			const largePlans = buildLargeGroupPlans(slotAssignments);
			const placedRects: Rect[] = [];
			const largeInstances: SpreadInstance[] = [];
			let failed = false;

			for (const plan of largePlans) {
				const rect = findLargePlacement(plan, ringSlots, placedRects, size.width, size.height);
				if (!rect) {
					failed = true;
					break;
				}

				placedRects.push(rect);
				largeInstances.push({
					...rect,
					overlayItem: plan.overlayItem,
					surface: plan.surface,
					mutationId: plan.mutationId,
					consumedSlots: plan.slots,
				});
			}

			if (failed) continue;

			const consumedSlotKeys = new SvelteSet<string>();
			for (const instance of largeInstances) {
				for (const slot of instance.consumedSlots) {
					consumedSlotKeys.add(slotKey(slot));
				}
			}

			return {
				slotAssignments: slotAssignments.map((assignment) => ({
					...assignment,
					consumedByLarge: consumedSlotKeys.has(slotKey(assignment.slot)),
				})),
				largeInstances,
			};
		}

		return {
			slotAssignments: (buildSlotAssignments(ringSlots, initialSlotIndex) ?? []).map((assignment) => ({
				...assignment,
				consumedByLarge: false,
			})),
			largeInstances: [] as SpreadInstance[],
		};
	});

	let bounds = $derived.by(() => {
		let minX = 0;
		let minY = 0;
		let maxX = size.width - 1;
		let maxY = size.height - 1;

		for (const assignment of spreadPlan.slotAssignments) {
			minX = Math.min(minX, assignment.slot.x);
			minY = Math.min(minY, assignment.slot.y);
			maxX = Math.max(maxX, assignment.slot.x);
			maxY = Math.max(maxY, assignment.slot.y);
		}

		for (const instance of spreadPlan.largeInstances) {
			minX = Math.min(minX, instance.x);
			minY = Math.min(minY, instance.y);
			maxX = Math.max(maxX, instance.x + instance.width - 1);
			maxY = Math.max(maxY, instance.y + instance.height - 1);
		}

		return {
			minX,
			minY,
			rows: maxY - minY + 1,
			cols: maxX - minX + 1,
		};
	});

	let cells = $derived.by(() => {
		const grid = Array.from({ length: bounds.rows }, (_, rowIdx) =>
			Array.from({ length: bounds.cols }, (_, colIdx): GridCell => {
				const x = bounds.minX + colIdx;
				const y = bounds.minY + rowIdx;
				const isTarget = x >= 0 && x < size.width && y >= 0 && y < size.height;

				return {
					blockName: mutation.growth.surface,
					isTarget,
				};
			})
		);

		for (const assignment of spreadPlan.slotAssignments) {
			const rowIdx = assignment.slot.y - bounds.minY;
			const colIdx = assignment.slot.x - bounds.minX;
			const cell = grid[rowIdx]?.[colIdx];
			if (!cell) continue;

			cell.blockName = assignment.surface;
			if (assignment.consumedByLarge) continue;

			cell.overlayItem = assignment.overlayItem;
			cell.mutationId = assignment.mutationId;
		}

		for (const instance of spreadPlan.largeInstances) {
			for (let y = instance.y; y < instance.y + instance.height; y++) {
				for (let x = instance.x; x < instance.x + instance.width; x++) {
					const rowIdx = y - bounds.minY;
					const colIdx = x - bounds.minX;
					const cell = grid[rowIdx]?.[colIdx];
					if (!cell) continue;

					cell.blockName = instance.surface;
				}
			}
		}

		return grid;
	});

	let overlays = $derived.by(() => {
		const items: GridOverlay[] = [
			{
				x: 0,
				y: 0,
				width: size.width,
				height: size.height,
				skyblockId: mutation.id,
				mutationId: mutation.id,
				key: `target-${mutation.id}`,
			},
		];

		for (const [idx, instance] of spreadPlan.largeInstances.entries()) {
			items.push({
				x: instance.x,
				y: instance.y,
				width: instance.width,
				height: instance.height,
				skyblockId: instance.overlayItem,
				mutationId: instance.mutationId,
				key: `spread-${idx}-${instance.x}-${instance.y}-${instance.overlayItem}`,
			});
		}

		return items;
	});

	const smallItemClass = 'w-full drop-shadow-md sm:size-6 md:size-10 brightness-150';

	function largeItemClass(overlay: GridOverlay): string {
		return `${getOverlayItemClass(overlay.width, overlay.height)} drop-shadow-md brightness-150`;
	}

	function getOverlayGridStyle(overlay: GridOverlay): string {
		return `grid-row: ${overlay.y - bounds.minY + 1} / span ${overlay.height}; grid-column: ${overlay.x - bounds.minX + 1} / span ${overlay.width};`;
	}
</script>

<div class="my-2 flex w-full justify-center">
	<div
		class="relative inline-grid w-fit gap-[0.5px] md:gap-0.5"
		style="grid-template-columns: repeat({bounds.cols}, 1fr);"
	>
		{#each cells as row, rowIdx (rowIdx)}
			{#each row as cell, colIdx (colIdx)}
				<div
					style="grid-row: {rowIdx + 1}; grid-column: {colIdx + 1};"
					class={`relative flex aspect-square w-full max-w-8 items-center justify-center overflow-hidden border sm:size-8 md:size-12 md:max-w-12 ${cell.isTarget ? 'ring-primary/50 ring-1' : ''}`}
				>
					{#if cell.blockName}
						<img
							src="/api/block/{cell.blockName}.webp{gbl.packsParam}"
							alt={cell.blockName}
							class="pixelated absolute inset-0 h-full w-full object-cover brightness-75"
						/>
					{/if}
					{#if cell.overlayItem}
						{#if cell.mutationId}
							<button
								type="button"
								class="relative z-10 cursor-pointer"
								onclick={() => selectMutation(cell.mutationId)}
								aria-label="View {cell.mutationId} mutation"
							>
								<ItemRender skyblockId={cell.overlayItem} class={smallItemClass} />
							</button>
						{:else}
							<ItemRender skyblockId={cell.overlayItem} class={smallItemClass} />
						{/if}
					{/if}
				</div>
			{/each}
		{/each}

		{#each overlays as overlay (overlay.key)}
			<div style={getOverlayGridStyle(overlay)} class="pointer-events-none z-10 flex items-center justify-center">
				{#if overlay.mutationId}
					<button
						type="button"
						class="pointer-events-auto cursor-pointer"
						onclick={() => selectMutation(overlay.mutationId)}
						aria-label="View {overlay.mutationId} mutation"
					>
						<ItemRender skyblockId={overlay.skyblockId} class={largeItemClass(overlay)} />
					</button>
				{:else}
					<ItemRender skyblockId={overlay.skyblockId} class={largeItemClass(overlay)} />
				{/if}
			</div>
		{/each}
	</div>
</div>
