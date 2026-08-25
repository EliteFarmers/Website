import { expect, test } from 'vitest';
import { findPestGearPieceConflict, pestSetCatalogSharesPieces } from './pest-loadout-constraints.js';

const sets = [
	{ id: 'one', name: 'One', pieces: { helmet: 'shared', chestplate: 'one-only' } },
	{ id: 'two', name: 'Two', pieces: { helmet: 'shared' } },
	{ id: 'three', name: 'Three', pieces: { helmet: null } },
];

test('reports every other set using a selected physical piece', () => {
	expect(findPestGearPieceConflict(sets, 'one', 'shared')).toStrictEqual({
		setIds: ['two'],
		setNames: ['Two'],
	});
	expect(findPestGearPieceConflict(sets, 'one', 'one-only')).toBeUndefined();
});

test('detects shared physical pieces across a set catalog', () => {
	expect(pestSetCatalogSharesPieces(sets)).toBe(true);
	expect(pestSetCatalogSharesPieces(sets.slice(0, 1))).toBe(false);
});
