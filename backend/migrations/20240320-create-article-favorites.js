'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('article_favorites', {
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
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      article_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // 添加唯一索引确保用户不能重复收藏同一篇文章
    await queryInterface.addIndex('article_favorites', ['user_id', 'article_id'], {
      unique: true,
      name: 'user_article_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('article_favorites');
  }
}; 