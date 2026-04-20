import { Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { BaseItem } from '../base-item.js';

export class HoeOfNoTilling extends BaseItem {
	get skyblockId() {
		return 'HOE_OF_NO_TILLING';
	}
	get name() {
		return 'Hoe of No Tilling';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Hoe_of_No_Tilling';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override type = ReforgeTarget.Hoe;
}
