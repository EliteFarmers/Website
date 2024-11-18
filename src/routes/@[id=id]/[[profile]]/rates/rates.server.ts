import { FarmingPlayer, type PlayerOptions } from 'farming-weight';

export default function ratesState(opt: PlayerOptions) {
	const options = $state(opt);
	let player = new FarmingPlayer(options);
	let cropFortune = player.cropFortune;

	return {
		get options() {
			return options;
		},
		get player() {
			return player;
		},
		refresh() {
			player = new FarmingPlayer(options);
		},
	};
}
