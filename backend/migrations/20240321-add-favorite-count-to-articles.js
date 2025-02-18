'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('articles', 'favorite_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    // 更新现有文章的收藏数
    const [articles] = await queryInterface.sequelize.query(
      `SELECT article_id, COUNT(*) as count 
       FROM article_favorites 
       GROUP BY article_id`
    );

    for (const article of articles) {
      await queryInterface.sequelize.query(
        `UPDATE articles 
         SET favorite_count = ? 
         WHERE id = ?`,
        {
          replacements: [article.count, article.article_id]
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('articles', 'favorite_count');
  }
}; 