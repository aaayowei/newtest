module.exports = (sequelize, Sequelize) => {
  const AssessmentAnswer = sequelize.define("AssessmentAnswer", {
    assessment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'assessments',
        key: 'id'
      }
    },
    question_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_questions',
        key: 'id'
      }
    },
    answer: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['assessment_id']
      },
      {
        fields: ['question_id']
      }
    ]
  });

  return AssessmentAnswer;
}; 