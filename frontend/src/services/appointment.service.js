import api from '@/plugins/axios'
import moment from 'moment'

class AppointmentService {
  // 检查是否可以预约该时间段
  async canCreateAppointment(data) {
    if (!data || !data.schedule_id) {
      throw new Error('预约信息不完整')
    }

    // 从可选时间段中获取日期和时间信息
    const selectedTimeSlot = data.selectedTimeSlot
    if (!selectedTimeSlot || !selectedTimeSlot.date || !selectedTimeSlot.time_slot) {
      throw new Error('时间段信息不完整')
    }

    const startTime = selectedTimeSlot.time_slot.split('-')[0]
    const appointmentDateTime = new Date(`${selectedTimeSlot.date} ${startTime}`)
    const now = new Date()
    
    // 检查是否是过去的时间
    if (appointmentDateTime < now) {
      throw new Error('不能预约过去的时间')
    }

    // 检查是否提前24小时预约
    const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60)
    if (hoursDiff < 24) {
      throw new Error('请至少提前24小时预约')
    }

    // 检查是否超过30天
    const daysDiff = hoursDiff / 24
    if (daysDiff > 30) {
      throw new Error('预约时间不能超过30天')
    }

    return true
  }

  // 创建预约
  async createAppointment(data) {
    console.log('创建预约，数据:', data)
    try {
      // 检查预约时间是否合理
      await this.canCreateAppointment(data)

      const response = await api.post('/appointments', data)
      console.log('创建预约响应:', response)
      return response.data
    } catch (error) {
      console.error('创建预约失败:', error)
      throw error
    }
  }

  // 获取预约列表
  async getAppointments(params) {
    console.log('获取预约列表，参数:', params)
    try {
      const response = await api.get('/appointments', { params })
      console.log('原始响应:', response)
      
      // 使用原始响应中的分页信息
      if (response && typeof response === 'object' && 'data' in response) {
        const originalData = response.data
        console.log('原始数据:', originalData)

        // 如果原始响应中包含完整的分页信息
        if (response.total !== undefined && Array.isArray(originalData)) {
          console.log('使用响应中的分页信息')
          return {
            total: response.total,
            currentPage: response.currentPage || parseInt(params.page) || 1,
            pageSize: response.pageSize || parseInt(params.limit) || 10,
            data: originalData
          }
        }

        // 如果原始数据是标准分页格式
        if (typeof originalData === 'object' && !Array.isArray(originalData) && 'total' in originalData && 'data' in originalData) {
          console.log('使用标准分页格式')
          return {
            total: originalData.total,
            currentPage: originalData.currentPage || parseInt(params.page) || 1,
            pageSize: originalData.pageSize || parseInt(params.limit) || 10,
            data: originalData.data || []
          }
        }

        // 如果只有数组数据
        if (Array.isArray(originalData)) {
          console.log('使用数组长度作为总数')
          return {
            total: originalData.length,
            currentPage: parseInt(params.page) || 1,
            pageSize: parseInt(params.limit) || 10,
            data: originalData
          }
        }
      }

      // 如果数据格式完全不对，返回空数据
      console.error('错误：无效的响应格式', response)
      return {
        total: 0,
        currentPage: parseInt(params.page) || 1,
        pageSize: parseInt(params.limit) || 10,
        data: []
      }
    } catch (error) {
      console.error('获取预约列表失败:', error)
      throw error
    }
  }

  // 获取预约详情
  async getAppointmentDetail(id) {
    console.log('获取预约详情，ID:', id)
    try {
      const response = await api.get(`/appointments/${id}`)
      console.log('获取预约详情响应:', response)
      console.log('响应数据类型:', typeof response)
      console.log('响应数据结构:', {
        response: response,
        data: response.data,
        status: response.status
      })
      
      if (!response) {
        throw new Error('API 响应为空')
      }

      // 如果响应本身就是数据（不是包含 data 属性的对象）
      const data = response.data || response
      if (!data) {
        throw new Error('API 响应数据为空')
      }

      console.log('处理后的数据:', data)
      return data
    } catch (error) {
      console.error('获取预约详情请求失败:', error.response || error)
      throw error
    }
  }

  // 检查是否可以取消预约
  async canCancelAppointment(appointment) {
    // 如果预约已经被取消或已完成，不能取消
    if (['cancelled', 'completed'].includes(appointment.status)) {
      throw new Error('该预约已不能取消')
    }

    // 如果预约已确认且已分配咨询室/聊天室，不能取消
    if (appointment.status === 'confirmed' && 
        (appointment.room_number || appointment.online_meeting_url)) {
      throw new Error('咨询师已确认预约，不能取消预约')
    }

    // 检查是否在预约时间12小时前
    const appointmentTime = moment(`${appointment.schedule.date} ${appointment.schedule.time_slot.split('-')[0]}`, 'YYYY-MM-DD HH:mm')
    const now = moment()
    const hoursDiff = appointmentTime.diff(now, 'hours')

    if (hoursDiff < 12) {
      throw new Error('预约时间不足12小时，不能取消')
    }

    return true
  }

  // 更新预约状态
  async updateAppointmentStatus(id, data) {
    console.log('更新预约状态，ID:', id, '数据:', data)
    try {
      // 如果是取消操作，先获取预约详情进行检查
      if (data.status === 'cancelled') {
        const appointment = await this.getAppointmentDetail(id)
        await this.canCancelAppointment(appointment)
      }

      const response = await api.patch(`/appointments/${id}/status`, data)
      console.log('更新预约状态响应:', response)
      
      return response.data || { success: true }
    } catch (error) {
      console.error('更新预约状态失败:', error.response || error)
      throw error.response?.data?.message ? new Error(error.response.data.message) : error
    }
  }

  // 提交评价
  async submitReview(id, data) {
    try {
      const response = await api.post(`/appointments/${id}/review`, data)
      return response.data
    } catch (error) {
      console.error('提交评价失败:', error)
      throw error
    }
  }

  // 提交咨询记录
  async submitNotes(id, data) {
    try {
      const response = await api.post(`/appointments/${id}/notes`, data)
      return response.data
    } catch (error) {
      console.error('提交咨询记录失败:', error)
      throw error
    }
  }

  // 分配咨询地点/链接
  async assignLocation(appointmentId, data) {
    const response = await api.patch(`/appointments/${appointmentId}/location`, data)
    return response
  }

  // 检查预约是否可以取消
  async checkCancellable(appointmentId) {
    try {
      const response = await api.get(`/appointments/${appointmentId}/can-cancel`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '检查预约是否可取消失败')
    }
  }

  // 取消预约
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await api.post(`/appointments/${appointmentId}/cancel`, {
        reason
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '取消预约失败')
    }
  }
}

export default new AppointmentService() 