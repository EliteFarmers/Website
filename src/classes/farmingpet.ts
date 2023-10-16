import { FarmingPetType } from '../constants/pets';

export function CreateFarmingPet(pet: FarmingPetType) {
	return new FarmingPet(pet);
}

export class FarmingPet {
	public readonly pet: FarmingPetType;

	constructor(pet: FarmingPetType) {
		this.pet = pet;
	}
}
