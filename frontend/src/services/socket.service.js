import { io } from 'socket.io-client';
import socketConfig from '../config/socket.config';
import { ElMessage } from 'element-plus';

class SocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Map();
  }

  // 初始化WebSocket连接
  connect() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('未找到token');
        return Promise.reject(new Error('未找到token'));
      }

      if (this.socket?.connected) {
        return Promise.resolve();
      }

      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      const options = {
        ...socketConfig.connectionOptions,
        auth: { token }
      };

      this.socket = io(socketConfig.SOCKET_URL, options);

      return new Promise((resolve, reject) => {
        let timeoutId;

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };

        this.socket.on('connect', () => {
          cleanup();
          this.setupEventListeners();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket连接错误:', error);
          cleanup();
          reject(new Error(`WebSocket连接失败: ${error.message}`));
        });

        this.socket.on('error', (error) => {
          console.error('Socket错误:', error);
          cleanup();
          reject(new Error(`Socket错误: ${error.message}`));
        });

        this.socket.on('disconnect', (reason) => {
          if (reason === 'io server disconnect') {
            this.socket.connect();
          }
        });

        this.socket.on('reconnect_attempt', () => {
          this.socket.auth = { token: localStorage.getItem('token') };
        });

        timeoutId = setTimeout(() => {
          console.error('WebSocket连接超时');
          cleanup();
          this.socket.disconnect();
          reject(new Error('WebSocket连接超时，请检查后端服务是否正常运行'));
        }, options.timeout || 45000);

        this.socket.connect();
      });
    } catch (error) {
      console.error('Socket连接失败:', error);
      return Promise.reject(error);
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    this.socket.on(socketConfig.events.ERROR, (error) => {
      console.error('WebSocket错误:', error);
      ElMessage.error('聊天服务连接失败，请刷新页面重试');
    });

    this.socket.on(socketConfig.events.RECEIVE_MESSAGE, (message) => {
      this.handleReceivedMessage(message);
    });

    this.socket.on(socketConfig.events.MESSAGE_READ, ({ messageId }) => {
      this.notifyMessageRead(messageId);
    });
  }

  // 加入聊天室
  joinRoom(appointmentId) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket未连接');
    }
    this.socket.emit(socketConfig.events.JOIN_ROOM, appointmentId);
  }

  // 发送消息
  sendMessage(appointmentId, receiverId, content, type = 'text') {
    if (!this.socket?.connected) {
      throw new Error('WebSocket未连接');
    }

    this.socket.emit(socketConfig.events.SEND_MESSAGE, {
      appointmentId,
      receiverId,
      content,
      type
    });
  }

  // 标记消息为已读
  markMessageAsRead(messageId) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket未连接');
    }

    this.socket.emit(socketConfig.events.MESSAGE_READ, { messageId });
  }

  // 处理接收到的消息
  handleReceivedMessage(message) {
    if (!message || !message.appointment_id) {
      console.error('收到无效消息格式:', message);
      return;
    }

    const appointmentId = message.appointment_id.toString();
    const handler = this.messageHandlers.get(appointmentId);
    
    if (handler) {
      try {
        handler(message);
      } catch (error) {
        console.error('消息处理失败:', error);
        this.reconnectChat(appointmentId);
      }
    } else {
      this.reconnectChat(appointmentId);
    }
  }

  // 重新连接聊天室
  async reconnectChat(appointmentId) {
    try {
      await this.connect();
      await this.joinRoom(appointmentId);
    } catch (error) {
      console.error('重新连接聊天室失败:', error);
    }
  }

  // 注册消息处理器
  registerMessageHandler(appointmentId, handler) {
    if (!appointmentId) {
      console.error('注册消息处理器失败: appointmentId 为空');
      return;
    }
    this.messageHandlers.set(appointmentId.toString(), handler);
  }

  // 通知消息已读
  notifyMessageRead(messageId) {
    this.messageHandlers.forEach((handler) => {
      if (typeof handler.onMessageRead === 'function') {
        handler.onMessageRead(messageId);
      }
    });
  }

  // 移除消息处理器
  removeMessageHandler(appointmentId) {
    if (appointmentId) {
      this.messageHandlers.delete(appointmentId.toString());
    }
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.messageHandlers.clear();
    }
  }
}

// 导出单例实例
export default new SocketService(); 