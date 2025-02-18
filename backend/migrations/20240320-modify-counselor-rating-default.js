'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Counselors', 'rating', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
      comment: '评分'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Counselors', 'rating', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 5.0,
      comment: '评分'
    });
  }
}; 