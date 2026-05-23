import type { ItemDefinition } from './definitions.js';
import {
	InfiniVacuum,
	InfiniVacuumHooverius,
	SkyMartHyperVacuum,
	SkyMartTurboVacuum,
	SkyMartVacuum,
} from './tools/vacuums.js';

export {
	InfiniVacuum,
	InfiniVacuumHooverius,
	SkyMartHyperVacuum,
	SkyMartTurboVacuum,
	SkyMartVacuum,
} from './tools/vacuums.js';

export type VacuumInfo = ItemDefinition;

export const VACUUMS: Partial<Record<string, VacuumInfo>> = {
	SKYMART_VACUUM: new SkyMartVacuum(),
	SKYMART_TURBO_VACUUM: new SkyMartTurboVacuum(),
	SKYMART_HYPER_VACUUM: new SkyMartHyperVacuum(),
	INFINI_VACUUM: new InfiniVacuum(),
	INFINI_VACUUM_HOOVERIUS: new InfiniVacuumHooverius(),
};
