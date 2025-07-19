import type { Crop } from '../../constants/crops.js';
import type { FortuneSourceProgress, FortuneUpgrade } from '../../constants/upgrades.js';
import type { EliteItemDto } from '../../fortune/item.js';
import type { UpgradeableInfo } from '../../fortune/upgradeable.js';

export interface DynamicFortuneSource<T> {
	name: string;
	crop?: Crop;
	api?: boolean;
	conditional?: boolean;
	wiki?: (source: T) => string | undefined;
	exists: (source: T) => boolean;
	active?: (source: T) => { active: boolean; reason?: string; fortune?: number };
	max: (source: T) => number;
	current: (source: T) => number;
	progress?: (source: T) => FortuneSourceProgress[];
	info?: (source: T) => {
		item?: EliteItemDto;
		info?: UpgradeableInfo;
		nextInfo?: UpgradeableInfo;
		maxInfo?: UpgradeableInfo;
	};
	upgrades?: (source: T) => FortuneUpgrade[];
}
