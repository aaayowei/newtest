const { Message } = require('../models');
const { Op } = require('sequelize');
const EncryptionUtil = require('../utils/encryption');

// 获取预约的聊天记录
exports.getChatHistory = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        appointment_id: appointmentId,
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      order: [['created_at', 'ASC']]
    });

    // 解密消息内容
    const decryptedMessages = messages.map(msg => ({
      id: msg.id,
      sender_id: msg.sender_id,
      content: EncryptionUtil.decrypt(msg.content, msg.encryption_key),
      created_at: msg.created_at
    }));

    res.json({
      success: true,
      messages: decryptedMessages
    });
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天记录失败'
    });
  }
}; 