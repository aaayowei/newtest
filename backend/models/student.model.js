module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define("Student", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    student_id: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
      comment: '学号'
    },
    department: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: '院系'
    },
    major: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: '专业'
    },
    grade: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: '年级'
    },
    class_name: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: '班级'
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Student.associate = (models) => {
    Student.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Student;
}; 