const socketConfig = require('../config/socket.config');
const EncryptionUtil = require('../utils/encryption');
const db = require('../models');
const Message = db.Message;
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupSocketServer();
  }

  setupSocketServer() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('未提供认证令牌');
        }

        const decoded = jwt.verify(token, config.secret);
        socket.user = decoded;
        next();
      } catch (error) {
        console.error('Socket认证失败:', error);
        next(new Error('认证失败: ' + error.message));
      }
    });

    this.io.on(socketConfig.events.CONNECT, (socket) => {
      this.connectedUsers.set(socket.user.id, socket);

      socket.on(socketConfig.events.JOIN_ROOM, async (appointmentId) => {
        try {
          const roomId = `appointment_${appointmentId}`;
          socket.join(roomId);

          const appointment = await db.Appointment.findByPk(appointmentId);
          if (appointment && appointment.is_anonymous && socket.user.id === appointment.student_id) {
            socket.emit(socketConfig.events.RECEIVE_MESSAGE, {
              id: 'system_' + Date.now(),
              sender_id: 'system',
              appointment_id: appointmentId,
              content: '您正在进行匿名咨询，咨询师将无法看到您的真实身份信息。',
              type: 'system',
              created_at: new Date()
            });
          }
        } catch (error) {
          console.error('加入聊天室失败:', error);
          socket.emit(socketConfig.events.ERROR, { message: '加入聊天室失败: ' + error.message });
        }
      });

      socket.on(socketConfig.events.SEND_MESSAGE, async (data) => {
        try {
          const { appointmentId, receiverId, content, type = 'text' } = data;
          const roomId = `appointment_${appointmentId}`;

          const encryptionKey = EncryptionUtil.generateKey();
          const encryptedContent = EncryptionUtil.encrypt(content, encryptionKey);

          const message = await Message.create({
            sender_id: socket.user.id,
            receiver_id: receiverId,
            appointment_id: appointmentId,
            content: encryptedContent,
            encryption_key: encryptionKey,
            type,
            status: 'sent'
          });

          this.io.to(roomId).emit(socketConfig.events.RECEIVE_MESSAGE, {
            id: message.id,
            sender_id: message.sender_id,
            appointment_id: appointmentId,
            content: content,
            type: message.type,
            created_at: message.created_at
          });

        } catch (error) {
          console.error('发送消息失败:', error);
          socket.emit(socketConfig.events.ERROR, { message: '发送消息失败: ' + error.message });
        }
      });

      socket.on(socketConfig.events.MESSAGE_READ, async (data) => {
        try {
          const { messageId } = data;
          await Message.update(
            { status: 'read' },
            { where: { id: messageId, receiver_id: socket.user.id } }
          );

          const message = await Message.findByPk(messageId);
          if (message) {
            const senderSocket = this.connectedUsers.get(message.sender_id);
            if (senderSocket) {
              senderSocket.emit(socketConfig.events.MESSAGE_READ, { messageId });
            }
          }
        } catch (error) {
          console.error('更新消息状态失败:', error);
          socket.emit(socketConfig.events.ERROR, { message: '更新消息状态失败: ' + error.message });
        }
      });

      socket.on(socketConfig.events.DISCONNECT, () => {
        this.connectedUsers.delete(socket.user.id);
      });
    });
  }
}

module.exports = SocketService; 