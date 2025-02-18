'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessment_questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      assessment_type: {
        type: Sequelize.ENUM('anxiety', 'depression', 'personality', 'other'),
        allowNull: false
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      options: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '选项及其描述'
      },
      score_rules: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '计分规则'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '题目顺序'
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

    // 添加索引
    await queryInterface.addIndex('assessment_questions', ['assessment_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assessment_questions');
  }
}; 