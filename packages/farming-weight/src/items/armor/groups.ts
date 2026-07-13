import type { UpgradeGroupDefinition } from '../../constants/upgrades.js';

const SET_TRANSITION_WARNING = 'Partial upgrades can reduce the active armor set tier.';

export function armorTierGroup(from: string, to: string): UpgradeGroupDefinition {
	return {
		id: `armor-tier:${from.toUpperCase()}:${to.toUpperCase()}`,
		label: `Upgrade ${titleCase(from)} Armor to ${titleCase(to)} Armor`,
		strategy: 'available-pieces',
		warning: SET_TRANSITION_WARNING,
	};
}

function titleCase(value: string): string {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}
