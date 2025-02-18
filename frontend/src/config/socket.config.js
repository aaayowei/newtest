export default {
  // WebSocket服务器地址
  SOCKET_URL: 'http://localhost:5000',
  
  // 连接选项
  connectionOptions: {
    path: '/socket.io/',
    auth: {
      token: null
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 45000,
    transports: ['websocket'],
    forceNew: true,
    withCredentials: true,
    pingTimeout: 30000,
    pingInterval: 10000,
    // 禁用自动重连到其他地址
    rememberUpgrade: true,
    secure: true,
    rejectUnauthorized: false
  },
  
  // 事件名称定义（与后端保持一致）
  events: {
    // 连接相关
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_ROOM: 'join_room',
    
    // 消息相关
    SEND_MESSAGE: 'send_message',
    RECEIVE_MESSAGE: 'receive_message',
    MESSAGE_READ: 'message_read',
    
    // 错误相关
    ERROR: 'error',
    CONNECT_ERROR: 'connect_error',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
    RECONNECT: 'reconnect',
    RECONNECT_ERROR: 'reconnect_error'
  }
}; 