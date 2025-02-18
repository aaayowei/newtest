'use strict';

const db = require('../models');
const { Op } = require('sequelize');
const Assessment = db.Assessment;
const AssessmentQuestion = db.AssessmentQuestion;
const AssessmentAnswer = db.AssessmentAnswer;
const User = db.User;

// 定义测评类型的题目数量要求
const REQUIRED_QUESTIONS = {
  anxiety: 20,    // SAS量表标准题目数
  depression: 20, // SDS量表标准题目数
  personality: 30 // 人格测评题目数
};

// 定义评分标准
const ASSESSMENT_STANDARDS = {
  anxiety: {
    normal: { min: 25, max: 49, label: '正常', advice: '您的焦虑水平在正常范围内，建议继续保持良好的心理状态。' },
    mild: { min: 50, max: 59, label: '轻度焦虑', advice: '您有轻度焦虑倾向，建议适当放松，培养兴趣爱好，保持规律作息。' },
    moderate: { min: 60, max: 69, label: '中度焦虑', advice: '您存在中度焦虑，建议及时寻求心理咨询师的帮助，学习焦虑管理技巧。' },
    severe: { min: 70, max: 100, label: '重度焦虑', advice: '您的焦虑程度较重，强烈建议及时寻求专业心理医生的帮助。' }
  },
  depression: {
    normal: { min: 25, max: 52, label: '正常', advice: '您的情绪状态良好，建议继续保持积极乐观的生活态度。' },
    mild: { min: 53, max: 62, label: '轻度抑郁', advice: '您有轻度抑郁倾向，建议多参与社交活动，保持规律作息，适当运动。' },
    moderate: { min: 63, max: 72, label: '中度抑郁', advice: '您存在中度抑郁，建议及时寻求心理咨询师的帮助，学习情绪管理方法。' },
    severe: { min: 73, max: 100, label: '重度抑郁', advice: '您的抑郁程度较重，强烈建议及时寻求专业心理医生的帮助。' }
  },
  personality: {
    typeA: { min: 70, max: 100, label: 'A型', advice: '您属于外向型性格，善于社交，富有活力。建议适当关注自己的情绪管理。' },
    typeB: { min: 40, max: 69, label: 'B型', advice: '您属于平衡型性格，适应能力强。建议继续保持这种灵活的处事方式。' },
    typeC: { min: 0, max: 39, label: 'C型', advice: '您属于内向型性格，善于思考。建议适当增加社交活动，扩展人际关系。' }
  }
};

// 计算标准分数
function calculateStandardScore(answers, type) {
  // 计算原始总分
  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
  
  if (type === 'anxiety' || type === 'depression') {
    // SAS和SDS使用标准计分方法：原始分 × 1.25
    const standardScore = Math.round(totalScore * 1.25 * 100) / 100;
    // 确保分数在有效范围内
    return Math.min(Math.max(standardScore, 25), 100);
  } else {
    // 人格测评使用百分比计算
    const maxPossibleScore = answers.length * 4; // 每题最高4分
    const standardScore = Math.round((totalScore / maxPossibleScore) * 100);
    return Math.min(Math.max(standardScore, 0), 100);
  }
}

// 生成评估结果
function generateResult(type, score) {
  const standards = ASSESSMENT_STANDARDS[type];
  let result = null;

  for (const level of Object.values(standards)) {
    if (score >= level.min && score <= level.max) {
      result = {
        level: level.label,
        score: score,
        advice: level.advice
      };
      break;
    }
  }

  return result;
}

// 获取测评列表
exports.getAssessments = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    
    if (type) {
      where.type = type;
    }

    // 获取所有可用的测评题目类型
    const questions = await AssessmentQuestion.findAll({
      attributes: ['assessment_type'],
      group: ['assessment_type']
    });

    const assessmentTypes = questions.map(q => q.assessment_type);

    res.json({
      assessmentTypes,
      message: '获取测评列表成功'
    });
  } catch (error) {
    console.error('Error in getAssessments:', error);
    res.status(500).json({ message: '获取测评列表失败' });
  }
};

// 获取测评题目
exports.getAssessmentQuestions = async (req, res) => {
  try {
    const { type } = req.params;
    
    // 对于焦虑和抑郁量表，直接返回按顺序排列的标准题目
    if (type === 'anxiety' || type === 'depression') {
      const questions = await AssessmentQuestion.findAll({
        where: { 
          assessment_type: type,
          order: { [Op.lte]: 20 }  // 只获取前20题标准题目
        },
        order: [['order', 'ASC']]
      });

      if (questions.length !== 20) {
        return res.status(400).json({
          message: `标准${type === 'anxiety' ? '焦虑' : '抑郁'}量表需要20道题目`
        });
      }

      return res.json({ questions });
    }
    
    // 对于人格测评，保持随机抽题的逻辑
    const questions = await AssessmentQuestion.findAll({
      where: { assessment_type: type },
      order: [['order', 'ASC']]
    });

    if (questions.length < REQUIRED_QUESTIONS[type]) {
      return res.status(400).json({
        message: `题库中题目数量不足，需要至少 ${REQUIRED_QUESTIONS[type]} 道题目`
      });
    }

    // 随机抽取指定数量的题目
    const selectedQuestions = questions
      .sort(() => 0.5 - Math.random())
      .slice(0, REQUIRED_QUESTIONS[type]);

    res.json({ questions: selectedQuestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 提交测评答案
exports.submitAssessment = async (req, res) => {
  try {
    const { type } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    console.log('Submitting assessment:', { type, userId });
    console.log('Answers received:', answers);

    if (answers.length !== REQUIRED_QUESTIONS[type]) {
      return res.status(400).json({
        message: '答题数量不正确'
      });
    }

    // 计算标准分
    const score = calculateStandardScore(answers, type);
    console.log('Calculated score:', score);
    
    // 生成评估结果
    const result = generateResult(type, score);
    console.log('Generated result:', result);

    if (!result) {
      console.error('Failed to generate result for score:', score);
      return res.status(500).json({ message: '生成评估结果失败' });
    }

    // 获取测评标题
    const titles = {
      anxiety: 'SAS焦虑自评量表',
      depression: 'SDS抑郁自评量表',
      personality: '人格特质测评'
    };

    const resultString = JSON.stringify(result);
    console.log('Result string to save:', resultString);

    // 创建测评记录
    const assessment = await Assessment.create({
      user_id: userId,
      type: type,
      title: titles[type] || '心理测评',
      score: Math.round(score), // 确保分数是整数
      result: resultString,
      completed_at: new Date()
    });

    console.log('Created assessment:', assessment.toJSON());

    // 保存答案详情
    const answerRecords = answers.map(answer => ({
      assessment_id: assessment.id,
      question_id: answer.questionId,
      answer: answer.answer,
      score: answer.score
    }));

    await AssessmentAnswer.bulkCreate(answerRecords);
    console.log('Saved answer records');

    // 确保返回解析后的结果对象
    res.json({
      assessmentId: assessment.id,
      score: score,
      result: result
    });
  } catch (error) {
    console.error('Error in submitAssessment:', error);
    res.status(500).json({ message: error.message });
  }
};

// 获取用户测评历史
exports.getUserAssessments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Getting assessments for user:', userId);

    // 检查权限
    if (req.user.user_type === 'student' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: '无权访问其他用户的测评记录' });
    }

    // 先获取总数
    const totalCount = await Assessment.count({
      where: { user_id: userId }
    });

    console.log('Total assessment count:', totalCount);

    // 获取分页数据
    const assessments = await Assessment.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'real_name']
        },
        {
          model: AssessmentAnswer,
          as: 'answers',
          include: [{
            model: AssessmentQuestion,
            as: 'question',
            attributes: ['question', 'options']
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('Found assessments:', assessments.length);

    // 处理每个测评的结果
    const processedAssessments = assessments.map(assessment => {
      const assessmentData = assessment.toJSON();
      console.log('Processing assessment:', assessmentData.id);
      console.log('Raw result value:', assessmentData.result);

      if (assessmentData.result) {
        try {
          assessmentData.result = typeof assessmentData.result === 'string'
            ? JSON.parse(assessmentData.result)
            : assessmentData.result;
          console.log('Parsed result:', assessmentData.result);
        } catch (error) {
          console.error('Error parsing assessment result:', error);
          assessmentData.result = null;
        }
      } else {
        console.log('No result data for assessment:', assessmentData.id);
      }
      return assessmentData;
    });

    res.json({
      total: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      assessments: processedAssessments
    });
  } catch (error) {
    console.error('Error in getUserAssessments:', error);
    res.status(500).json({ message: error.message });
  }
};

// 获取测评详情
exports.getAssessmentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assessment = await Assessment.findByPk(id, {
      include: [
        {
          model: AssessmentAnswer,
          as: 'answers',
          include: [{
            model: AssessmentQuestion,
            as: 'question'
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['username', 'real_name']
        }
      ]
    });

    if (!assessment) {
      return res.status(404).json({ message: '未找到测评记录' });
    }

    // 检查权限
    if (req.user.user_type === 'student' && req.user.id !== assessment.user_id) {
      return res.status(403).json({ message: '无权查看其他用户的测评记录' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Error in getAssessmentDetail:', error);
    res.status(500).json({ message: '获取测评详情失败' });
  }
};

// 获取测评统计数据
exports.getStatistics = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { '$user.username$': { [Op.like]: `%${search}%` } },
        { '$user.real_name$': { [Op.like]: `%${search}%` } }
      ];
    }

    // 先获取总数，不包含关联表
    const totalCount = await Assessment.count({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: []
        }
      ],
      distinct: true
    });

    // 获取分页数据
    const assessments = await Assessment.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'real_name']
        }
      ],
      order: [['completed_at', 'DESC']]
    });

    // 处理每个测评的结果
    const processedAssessments = assessments.map(assessment => {
      const assessmentData = assessment.toJSON();
      
      if (assessmentData.result) {
        try {
          assessmentData.result = typeof assessmentData.result === 'string'
            ? JSON.parse(assessmentData.result)
            : assessmentData.result;
        } catch (error) {
          console.error('Error parsing assessment result:', error);
          assessmentData.result = null;
        }
      }
      
      return assessmentData;
    });

    res.json({
      total: totalCount,
      assessments: processedAssessments
    });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ 
      message: '获取测评统计数据失败',
      error: error.message 
    });
  }
};

// 获取题库列表
exports.getQuestionsList = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (type) {
      where.assessment_type = type;
    }

    const { count, rows } = await AssessmentQuestion.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['order', 'ASC'], ['id', 'ASC']]
    });

    // 标记标准题目
    const questions = rows.map(q => ({
      ...q.toJSON(),
      isStandard: (q.assessment_type === 'anxiety' || q.assessment_type === 'depression') && q.order <= 20
    }));

    res.json({
      total: count,
      questions
    });
  } catch (error) {
    console.error('Error in getQuestionsList:', error);
    res.status(500).json({ 
      message: '获取题库列表失败',
      error: error.message 
    });
  }
};

// 创建测评题目
exports.createQuestion = async (req, res) => {
  try {
    const { assessment_type, question, options, score_rules } = req.body;
    
    if (!assessment_type || !question || !options || !score_rules) {
      return res.status(400).json({
        message: '请提供完整的题目信息'
      });
    }

    // 不允许添加焦虑和抑郁量表的额外题目
    if (assessment_type === 'anxiety' || assessment_type === 'depression') {
      return res.status(403).json({
        message: `${assessment_type === 'anxiety' ? 'SAS焦虑' : 'SDS抑郁'}量表使用固定的标准题目，不允许添加新题目`
      });
    }

    // 检查题目数量是否超过限制
    const count = await AssessmentQuestion.count({
      where: { assessment_type }
    });

    // 这里可以设置一个合理的上限，比如标准题目数的两倍
    const maxQuestions = REQUIRED_QUESTIONS[assessment_type] * 2;
    if (count >= maxQuestions) {
      return res.status(400).json({
        message: `${assessment_type === 'personality' ? '人格测评' : '其他测评'}题目数量已达到上限 ${maxQuestions} 题`
      });
    }

    const newQuestion = await AssessmentQuestion.create({
      assessment_type,
      question,
      options,
      score_rules,
      order: count + 1
    });

    res.status(201).json({
      message: '创建成功',
      question: newQuestion
    });
  } catch (error) {
    console.error('Error in createQuestion:', error);
    res.status(500).json({ 
      message: '创建题目失败',
      error: error.message 
    });
  }
};

// 更新测评题目
exports.updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { assessment_type, question, options, score_rules } = req.body;

    // 获取原题目信息
    const existingQuestion = await AssessmentQuestion.findByPk(questionId);
    
    if (!existingQuestion) {
      return res.status(404).json({
        message: '题目不存在'
      });
    }

    // 检查是否是标准量表题目
    if ((existingQuestion.assessment_type === 'anxiety' || existingQuestion.assessment_type === 'depression') && 
        existingQuestion.order <= 20) {
      return res.status(403).json({
        message: 'SAS和SDS的标准题目不允许修改'
      });
    }

    // 更新题目
    const updatedQuestion = await existingQuestion.update({
      assessment_type,
      question,
      options,
      score_rules
    });

    res.json({
      message: '更新成功',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    res.status(500).json({
      message: '更新题目失败',
      error: error.message
    });
  }
};

// 删除测评题目
exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await AssessmentQuestion.findByPk(questionId);

    if (!question) {
      return res.status(404).json({
        message: '题目不存在'
      });
    }

    // 检查是否是标准量表题目
    if ((question.assessment_type === 'anxiety' || question.assessment_type === 'depression') && 
        question.order <= 20) {
      return res.status(403).json({
        message: 'SAS和SDS的标准题目不允许删除'
      });
    }

    // 检查删除后的题目数量是否满足最低要求
    const count = await AssessmentQuestion.count({
      where: { assessment_type: question.assessment_type }
    });

    const minRequired = REQUIRED_QUESTIONS[question.assessment_type];
    if (count <= minRequired) {
      return res.status(400).json({
        message: `${question.assessment_type === 'anxiety' ? '焦虑测评' : 
                  question.assessment_type === 'depression' ? '抑郁测评' : 
                  question.assessment_type === 'personality' ? '人格测评' : '其他测评'}
                  题目数量不能少于 ${minRequired} 题`
      });
    }

    await question.destroy();
    res.json({
      message: '删除成功'
    });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({
      message: '删除题目失败',
      error: error.message
    });
  }
}; 