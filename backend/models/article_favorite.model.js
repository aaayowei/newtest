'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ArticleFavorite extends Model {
    static associate(models) {
      // 定义关联关系
      ArticleFavorite.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      ArticleFavorite.belongsTo(models.Article, {
        foreignKey: 'article_id',
        as: 'article'
      });
    }
  }

  ArticleFavorite.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ArticleFavorite',
    tableName: 'article_favorites',
    underscored: true
  });

  return ArticleFavorite;
}; 