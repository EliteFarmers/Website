'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('users', 'eventCredits', {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		});

		await queryInterface.addColumn('users', 'leaderboardCredits', {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('users', 'eventCredits');
		await queryInterface.removeColumn('users', 'leaderboardCredits');
	},
};
