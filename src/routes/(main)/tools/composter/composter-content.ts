import { ComposterUpgrade } from 'farming-weight';

export const upgradeSettings = [
	{ key: ComposterUpgrade.Speed, name: 'Composter Speed', detail: '+20% speed per level' },
	{ key: ComposterUpgrade.MultiDrop, name: 'Multi Drop', detail: '+3% extra Compost chance per level' },
	{ key: ComposterUpgrade.FuelCap, name: 'Fuel Cap', detail: '+30,000 capacity per level' },
	{ key: ComposterUpgrade.OrganicMatterCap, name: 'Organic Matter Cap', detail: '+30,000 capacity per level' },
	{ key: ComposterUpgrade.CostReduction, name: 'Cost Reduction', detail: '-1% input cost per level' },
] as const;

export const faqItems = [
	{
		question: 'How are upgrades applied?',
		answer: 'Speed shortens the base cycle time of ten minutes. Multi Drop increases the expected compost output without using extra materials. Cost Reduction lowers the Organic Matter and Fuel needed for each cycle.',
	},
	{
		question: 'Which prices are used?',
		answer: 'Materials bought on the Bazaar use averaged prices for your selected purchase method. Items only available at auction use the recent lowest price. Biofuel uses its fixed NPC price of 20,000 coins. Compost revenue is based on whether you choose sell orders or instant sales.',
	},
	{
		question: 'Why are some Organic Matter items unavailable?',
		answer: 'Your Composter needs enough Organic Matter capacity to hold the full value of one item. Upgrade Organic Matter Cap to use larger items such as Condensed Fermento or Condensed Helianthus.',
	},
];
