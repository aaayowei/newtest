module.exports = (sequelize, Sequelize) => {
  const Article = sequelize.define("Article", {
    title: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    author_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    category: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    tags: {
      type: Sequelize.JSON,
      allowNull: true
    },
    cover_image: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    view_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    favorite_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Article;
}; 