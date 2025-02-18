module.exports = {
  // WebSocket连接配置
  options: {
    cors: {
      origin: "http://localhost:8080", // 前端应用的地址
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true
    },
    allowEIO3: true,
    pingTimeout: 60000, // 60秒超时
    pingInterval: 25000, // 25秒心跳间隔
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    connectTimeout: 45000,
    debug: true
  },
  
  // 事件名称定义
  events: {
    // 连接相关
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    
    // 消息相关
    SEND_MESSAGE: 'send_message',
    RECEIVE_MESSAGE: 'receive_message',
    MESSAGE_DELIVERED: 'message_delivered',
    MESSAGE_READ: 'message_read',
    
    // 错误相关
    ERROR: 'error'
  }
}; 