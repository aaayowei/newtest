import api from '@/plugins/axios'

class UserService {
  // 获取当前用户信息
  async getCurrentUserInfo() {
    const response = await api.get('/users/profile')
    
    // 检查响应格式
    if (!response) {
      throw new Error('No response from server')
    }
    
    let userData = null
    
    // 如果response包含success和data属性
    if (response.success && response.data) {
      userData = response.data
    }
    // 如果response本身就是数据
    else if (response.id) {
      userData = response
    }
    
    if (!userData) {
      throw new Error('Invalid response format')
    }

    // 构造返回数据
    return {
      ...userData,
      userType: userData.userType || userData.user_type,
      // 根据用户类型返回不同的profile
      ...(userData.userType === 'student' || userData.user_type === 'student' ? {
        student_profile: {
          student_id: userData.student_profile?.student_id || '',
          department: userData.student_profile?.department || '',
          major: userData.student_profile?.major || '',
          grade: userData.student_profile?.grade || '',
          class_name: userData.student_profile?.class_name || ''
        }
      } : {}),
      ...(userData.userType === 'counselor' || userData.user_type === 'counselor' ? {
        counselor_profile: userData.counselor_profile || {
          title: '',
          expertise: '',
          introduction: '',
          education: '',
          avatar: '',
          consultation_count: 0,
          rating: 0,
          satisfaction_rate: 100.0
        }
      } : {})
    }
  }

  // 修改密码
  async changePassword(data) {
    try {
      const response = await api.post('/users/change-password', data)
      return response
    } catch (error) {
      // 直接抛出后端返回的错误消息
      throw new Error(error.response?.data?.message || '修改密码失败，请稍后重试')
    }
  }

  // 更新用户信息
  async updateProfile(data) {
    try {
      const response = await api.put('/users/profile', data)
      
      if (!response) {
        throw new Error('No response from server')
      }
      
      if (response.success) {
        return response
      }
      
      throw new Error(response.message || '更新失败')
    } catch (error) {
      // 如果是后端返回的具体错误信息，直接抛出
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      // 其他错误使用通用错误信息
      throw new Error('更新用户信息失败，请稍后重试')
    }
  }

  // 上传头像
  async uploadAvatar(formData) {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default new UserService() 