'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Students', 'major', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: '未设置', // 为现有记录提供默认值
      comment: '专业'
    });

    // 修改 class_name 为可选
    await queryInterface.changeColumn('Students', 'class_name', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: '班级'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Students', 'major');
    
    // 恢复 class_name 为必填
    await queryInterface.changeColumn('Students', 'class_name', {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: '班级'
    });
  }
}; 