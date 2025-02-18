import request from '@/plugins/axios'

class CounselorService {
  // 获取咨询师列表
  async getCounselors(params) {
    const response = await request({
      url: '/counselors',
      method: 'get',
      params
    })
    return response
  }

  // 获取推荐咨询师
  async getRecommendedCounselors() {
    const response = await request({
      url: '/counselors',
      method: 'get',
      params: {
        limit: 4,
        sort: 'rating',
        order: 'desc'
      }
    })
    return response
  }

  // 获取咨询师详情
  async getCounselorById(id) {
    const response = await request({
      url: `/counselors/${id}`,
      method: 'get'
    })
    return response
  }

  // 获取咨询师可用时间段
  async getCounselorSchedule(counselorId, startDate, endDate) {
    const response = await request({
      url: `/counselors/${counselorId}/schedules`,
      method: 'get',
      params: { start_date: startDate, end_date: endDate }
    })
    return { data: response }
  }

  // 获取咨询师评价列表
  async getCounselorReviews(counselorId, params) {
    const response = await request({
      url: `/counselors/${counselorId}/reviews`,
      method: 'get',
      params
    })
    return response
  }
}

export default new CounselorService() 