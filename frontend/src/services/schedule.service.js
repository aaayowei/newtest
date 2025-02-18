import request from '@/plugins/axios'

class ScheduleService {
  // 获取排班列表
  async getSchedules(year, month, counselorId) {
    const response = await request({
      url: '/admin/schedules',
      method: 'get',
      params: { year, month, counselorId }
    })
    return response
  }

  // 获取咨询师自己的排班
  async getMyCounselorSchedules(year, month) {
    const response = await request({
      url: '/counselors/my/schedules',
      method: 'get',
      params: { year, month }
    })
    return response
  }

  // 添加排班
  async addSchedules(counselorId, date, timeSlots) {
    const response = await request({
      url: '/admin/schedules',
      method: 'post',
      data: { counselorId, date, timeSlots }
    })
    return response
  }

  // 批量添加排班
  async batchAddSchedules(data) {
    const response = await request({
      url: '/admin/schedules/batch',
      method: 'post',
      data
    })
    return response
  }

  // 取消排班
  async cancelSchedule(scheduleId) {
    const response = await request({
      url: `/admin/schedules/${scheduleId}`,
      method: 'delete'
    })
    return response
  }
}

export default new ScheduleService() 