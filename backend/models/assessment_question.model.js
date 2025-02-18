module.exports = (sequelize, Sequelize) => {
  const AssessmentQuestion = sequelize.define("AssessmentQuestion", {
    assessment_type: {
      type: Sequelize.ENUM('anxiety', 'depression', 'personality', 'other'),
      allowNull: false
    },
    question: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    options: {
      type: Sequelize.JSON,
      allowNull: false,
      comment: '选项及其描述'
    },
    score_rules: {
      type: Sequelize.JSON,
      allowNull: false,
      comment: '计分规则'
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '题目顺序'
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['assessment_type']
      }
    ]
  });

  return AssessmentQuestion;
}; 