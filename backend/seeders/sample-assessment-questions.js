'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 焦虑自评量表（SAS，Zung Self-Rating Anxiety Scale）标准题目
    const anxietyQuestions = [
      {
        assessment_type: 'anxiety',
        question: '我感到比平常更紧张和焦虑',
        options: JSON.stringify({
          A: '很少',
          B: '有时',
          C: '经常',
          D: '总是'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // ... 添加更多焦虑测评题目 ...
    ];

    // 抑郁自评量表（SDS，Zung Self-Rating Depression Scale）标准题目
    const depressionQuestions = [
      {
        assessment_type: 'depression',
        question: '我感到情绪低落、沮丧',
        options: JSON.stringify({
          A: '很少',
          B: '有时',
          C: '经常',
          D: '总是'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // ... 添加更多抑郁测评题目 ...
    ];

    // 人格特质测评题目
    const personalityQuestions = [
      {
        assessment_type: 'personality',
        question: '在社交场合中，我倾向于',
        options: JSON.stringify({
          A: '主动与他人交谈',
          B: '等待他人来与我交谈',
          C: '保持适度的社交',
          D: '避免社交互动'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 2,
          C: 3,
          D: 1
        }),
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // ... 添加更多性格测评题目 ...
    ];

    const allQuestions = [
      ...anxietyQuestions,
      ...depressionQuestions,
      ...personalityQuestions
    ];

    await queryInterface.bulkInsert('assessment_questions', allQuestions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('assessment_questions', null, {});
  }
}; 