import api from '@/plugins/axios';

class AssessmentService {
  // 获取测评列表
  getAssessments(params) {
    return api.get('/assessments', { params });
  }

  // 获取测评题目
  getAssessmentQuestions(type) {
    return api.get(`/assessments/type/${type}/questions`);
  }

  // 提交测评答案
  submitAssessment(type, data) {
    console.log('Service submitting:', { type, data });
    return api.post(`/assessments/type/${type}/submit`, { answers: data.answers });
  }

  // 获取用户测评历史
  getUserAssessments(userId, params) {
    return api.get(`/assessments/user/${userId}/history`, { params });
  }

  // 获取测评详情
  getAssessmentDetail(id) {
    return api.get(`/assessments/${id}`);
  }

  // 获取测评统计数据
  getStatistics(params) {
    return api.get('/assessments/statistics', { params });
  }

  // 管理员：获取题库列表
  getQuestionsList(params) {
    return api.get('/assessments/questions', { params });
  }

  // 管理员：创建测评题目
  createQuestion(data) {
    const { assessment_type, question, options, score_rules } = data;
    return api.post('/assessments/questions', {
      assessment_type,
      question,
      options,
      score_rules
    });
  }

  // 管理员：更新测评题目
  updateQuestion(id, data) {
    const { assessment_type, question, options, score_rules } = data;
    return api.put(`/assessments/questions/${id}`, {
      assessment_type,
      question,
      options,
      score_rules
    });
  }

  // 管理员：删除测评题目
  deleteQuestion(id) {
    return api.delete(`/assessments/questions/${id}`);
  }
}

export default new AssessmentService(); 