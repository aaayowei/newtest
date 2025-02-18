module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    username: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    user_type: {
      type: Sequelize.ENUM('student', 'counselor', 'admin'),
      allowNull: false
    },
    gender: {
      type: Sequelize.ENUM('male', 'female'),
      allowNull: true
    },
    real_name: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
}; 