export interface PestGearSetLike {
	id: string;
	name: string;
	pieces: object;
}

export interface PestGearPieceConflict {
	setIds: string[];
	setNames: string[];
}

export function findPestGearPieceConflict(
	sets: readonly PestGearSetLike[],
	currentSetId: string | undefined,
	uuid: string | null | undefined
): PestGearPieceConflict | undefined {
	if (!uuid) return;
	const conflicts = sets.filter(
		(set) => set.id !== currentSetId && getSetPieceUuids(set).some((pieceUuid) => pieceUuid === uuid)
	);
	if (conflicts.length === 0) return;
	return {
		setIds: conflicts.map((set) => set.id),
		setNames: conflicts.map((set) => set.name),
	};
}

export function pestSetCatalogSharesPieces(sets: readonly PestGearSetLike[]): boolean {
	const usedUuids = new Set<string>();
	for (const set of sets) {
		for (const uuid of getSetPieceUuids(set)) {
			if (!uuid) continue;
			if (usedUuids.has(uuid)) return true;
			usedUuids.add(uuid);
		}
	}
	return false;
}

function getSetPieceUuids(set: PestGearSetLike): (string | null | undefined)[] {
	return Object.values(set.pieces) as (string | null | undefined)[];
}
