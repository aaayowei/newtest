'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CounselorSchedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      counselor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Counselors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: '咨询日期'
      },
      time_slot: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '时间段'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'available',
        comment: '状态：available-可用，booked-已预约，unavailable-不可用'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CounselorSchedules');
  }
};
