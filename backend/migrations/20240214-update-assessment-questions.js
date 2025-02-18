'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 修改 assessment_type 字段
    await queryInterface.changeColumn('assessment_questions', 'assessment_type', {
      type: Sequelize.ENUM('anxiety', 'depression', 'personality', 'other'),
      allowNull: false
    });

    // 修改 options 字段
    await queryInterface.changeColumn('assessment_questions', 'options', {
      type: Sequelize.JSON,
      allowNull: false,
      comment: '选项及其描述'
    });

    // 修改 score_rules 字段
    await queryInterface.changeColumn('assessment_questions', 'score_rules', {
      type: Sequelize.JSON,
      allowNull: false,
      comment: '计分规则'
    });

    // 添加 order 字段（如果不存在）
    await queryInterface.addColumn('assessment_questions', 'order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '题目顺序'
    }).catch(error => {
      if (error.message.includes('Duplicate column name')) {
        console.log('Column order already exists');
      } else {
        throw error;
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 这里不需要做任何操作，因为我们不想在回滚时删除这些字段
  }
}; 