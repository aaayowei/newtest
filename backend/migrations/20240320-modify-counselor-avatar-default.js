'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Counselors', 'avatar', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      comment: '头像路径'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Counselors', 'avatar', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: '/avatars/default.png',
      comment: '头像路径'
    });
  }
}; 