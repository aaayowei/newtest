'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Counselors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '职称'
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: '/avatars/default.png',
        comment: '头像路径'
      },
      expertise: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '专业领域，用逗号分隔'
      },
      introduction: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '简介'
      },
      education: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '教育背景'
      },
      consultation_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '咨询次数'
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 5.0,
        comment: '评分'
      },
      satisfaction_rate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 100.0,
        comment: '满意度'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'available',
        comment: '状态：available-可用，unavailable-不可用'
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
    await queryInterface.dropTable('Counselors');
  }
};
