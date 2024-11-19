import { expect, test } from "vitest";
import { calculateDetailedAverageDrops } from "./ratecalc.js";
import { Crop } from "../constants/crops";

test('Rate calc test', () => {
	const drops = calculateDetailedAverageDrops({
		blocksBroken: 24_000,
		farmingFortune: 100,
		bountiful: true,
		mooshroom: true,
	})

	expect(drops[Crop.Wheat].collection).toBe(48_000);

	expect(drops[Crop.NetherWart].otherCollection["Fermento"]).toBe(2);
	expect(drops[Crop.SugarCane].otherCollection["Fermento"]).toBe(2);
	expect(drops[Crop.Cactus].otherCollection["Fermento"]).toBe(2);
});