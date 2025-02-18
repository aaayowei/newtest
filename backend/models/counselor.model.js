module.exports = (sequelize, Sequelize) => {
  const Counselor = sequelize.define("Counselor", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    title: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: '职称'
    },
    avatar: {
      type: Sequelize.STRING(255),
      allowNull: true,
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
      defaultValue: 0.0,
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
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Counselor.associate = (models) => {
    Counselor.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Counselor;
}; 