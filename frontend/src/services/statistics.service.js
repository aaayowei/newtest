import api from '@/plugins/axios';

class StatisticsService {
  getOverviewStats(params) {
    return api.get('/statistics/overview', { params });
  }

  getAssessmentStats(params) {
    return api.get('/statistics/assessments', { params });
  }

  getAppointmentTrends(params) {
    return api.get('/statistics/appointments', { params });
  }
}

export default new StatisticsService(); 