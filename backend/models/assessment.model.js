module.exports = (sequelize, Sequelize) => {
  const Assessment = sequelize.define("Assessment", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('anxiety', 'depression', 'personality', 'other'),
      allowNull: false
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    result: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
      allowNull: true,
      defaultValue: 'pending'
    },
    completed_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Assessment;
}; 