import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      token: token ? 'present' : 'missing'
    });
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  error => {
    console.error('Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // 如果是 401 错误，可能是 token 过期，清除用户信息并跳转到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // 显示错误消息
    const message = error.response?.data?.message || error.message || '请求失败';
    ElMessage.error(message);
    
    return Promise.reject(error);
  }
);

export default instance; 