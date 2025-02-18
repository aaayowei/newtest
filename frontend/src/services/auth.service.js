import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

class AuthService {
  async login(username, password, userType) {
    try {
      console.log('登录请求参数:', { username, userType });
      const response = await axios.post(API_URL + 'login', {
        username,
        password,
        userType
      });
      console.log('登录响应:', response.data);
      
      // 存储用户信息和token
      if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(username, password, userType) {
    try {
      const response = await axios.post(API_URL + 'register', {
        username,
        password,
        userType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  handleError(error) {
    console.error('API 错误:', error);
    if (error.response) {
      // 服务器响应的错误信息
      return new Error(error.response.data.message || '操作失败');
    } else if (error.request) {
      // 请求发送失败
      return new Error('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      return new Error('操作失败，请稍后重试');
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.userType === 'admin';
  }

  async checkUsername(username) {
    try {
      const response = await axios.post(API_URL + 'check-username', {
        username
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  encryptPassword(password) {
    // 这里使用简单的加密方式，实际项目中建议使用更安全的方式
    return btoa(password);
  }

  decryptPassword(encryptedPassword) {
    return atob(encryptedPassword);
  }

  saveUserData(userData) {
    if (userData.password) {
      userData.password = this.encryptPassword(userData.password);
    }
    localStorage.setItem('rememberedUser', JSON.stringify(userData));
  }

  getSavedUserData() {
    const userData = localStorage.getItem('rememberedUser');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.password) {
        parsed.password = this.decryptPassword(parsed.password);
      }
      return parsed;
    }
    return null;
  }
}

export default new AuthService(); 