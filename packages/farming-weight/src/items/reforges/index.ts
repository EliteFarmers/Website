import type { BaseReforge } from './base.js';
import { BlessedReforge } from './blessed.js';
import { BloomingReforge } from './blooming.js';
import { BountifulReforge } from './bountiful.js';
import { BustlingReforge } from './bustling.js';
import { DeepFriedReforge } from './deep-fried.js';
import { EarthyReforge } from './earthy.js';
import { GreenThumbReforge } from './green-thumb.js';
import { MantidReforge } from './mantid.js';
import { MossyReforge } from './mossy.js';
import { OverpricedReforge } from './overpriced.js';
import { RobustReforge } from './robust.js';
import { RootedReforge } from './rooted.js';
import { SqueakyReforge } from './squeaky.js';

export * from './base.js';
export * from './blessed.js';
export * from './blooming.js';
export * from './bountiful.js';
export * from './bustling.js';
export * from './deep-fried.js';
export * from './earthy.js';
export * from './green-thumb.js';
export * from './mantid.js';
export * from './mossy.js';
export * from './overpriced.js';
export * from './robust.js';
export * from './rooted.js';
export * from './squeaky.js';

export const REFORGE_SOURCES: Record<string, BaseReforge> = {
	bountiful: new BountifulReforge(),
	blessed: new BlessedReforge(),
	earthy: new EarthyReforge(),
	green_thumb: new GreenThumbReforge(),
	robust: new RobustReforge(),
	bustling: new BustlingReforge(),
	mossy: new MossyReforge(),
	blooming: new BloomingReforge(),
	rooted: new RootedReforge(),
	squeaky: new SqueakyReforge(),
	mantid: new MantidReforge(),
	deep_fried: new DeepFriedReforge(),
	overpriced: new OverpricedReforge(),
};
