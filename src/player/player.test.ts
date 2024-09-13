import { expect, test } from "vitest";
import { FarmingPlayer } from "./player";

test("Player construct test", () => {
	const player = new FarmingPlayer({});
	expect(player.fortune).toBe(0);
});

test('Temp fortune test', () => {
	const player = new FarmingPlayer({
		temporaryFortune: {
			centuryCake: true,
			chocolateTruffle: true,
			flourSpray: true,
			pestTurnIn: 200,
			harvestPotion: true,
			magic8Ball: true,
			springFilter: true,
		},
	});

	expect(player.tempFortuneBreakdown).toStrictEqual({
		'Century Cake': 5,
		'Refined Dark Chocolate Truffle': 30,
		'Fine Flour Spray': 20,
		'Pest Turn-In': 200,
		'Harvest Harbinger Potion': 50,
		'Magic 8 Ball': 25,
		'Spring Filter': 25,
	});
});