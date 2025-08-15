import type { Crop } from '../../constants/crops.js';
import type { FortuneSourceProgress, FortuneUpgrade, UpgradeInfo } from '../../constants/upgrades.js';
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

export interface DynamicUpgradeSource<T, Output = unknown> {
	name: string;
	api?: boolean;
	conditional?: boolean;
	key?: string | ((source: T) => string);
	wiki?: (source: T) => string | undefined;
	exists: (source: T) => boolean;
	active?: (source: T) => { active: boolean; reason?: string; output?: Output };
	max: (source: T) => Output;
	current: (source: T) => Output;
	progress: (source: T) => UpgradeSourceProgress<Output>;
	info?: (source: T) => {
		item?: EliteItemDto;
		info?: UpgradeableInfo;
		nextInfo?: UpgradeableInfo;
		maxInfo?: UpgradeableInfo;
	};
	upgrades?: (source: T) => UpgradeInfo<Output>[];
}

export interface UpgradeSourceProgress<Output> {
	key?: string;
	name: string;
	current: number;
	max: number;
	perLevel: number;
	ratio: number;
	wiki?: string;
	upgrades?: UpgradeInfo<Output>[];
	progress?: UpgradeSourceProgress<Output>[];
	item?: EliteItemDto;
	info?: UpgradeableInfo;
	nextInfo?: UpgradeableInfo;
	maxInfo?: UpgradeableInfo;
	api?: boolean;
	active?: {
		active: boolean;
		reason?: string;
		output?: Output;
	};
}
