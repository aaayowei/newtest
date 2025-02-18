import api from '@/plugins/axios'

class NotificationService {
  // 获取未读通知
  async getUnreadNotifications() {
    try {
      const response = await api.get('/notifications/unread')
      
      // 如果响应本身就是数组
      if (Array.isArray(response)) {
        return response
      }

      // 如果响应是对象且有data字段
      if (response && response.data) {
        // 如果data字段是数组
        if (Array.isArray(response.data)) {
          return response.data
        }
        
        // 如果data字段包含嵌套的data数组
        if (typeof response.data === 'object' && Array.isArray(response.data.data)) {
          return response.data.data
        }
      }

      return []
    } catch (error) {
      console.error('获取未读通知失败:', error)
      return []
    }
  }

  // 标记通知为已读
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error('标记通知已读失败:', error)
      throw error
    }
  }
}

export default new NotificationService() 