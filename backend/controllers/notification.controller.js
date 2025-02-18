const notificationService = require('../services/notification.service');

// 获取用户的未读通知
exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.user.id);
    
    // 确保返回的是数组
    if (!Array.isArray(notifications)) {
      return res.json([]);
    }
    
    res.json(notifications);
  } catch (error) {
    console.error('获取未读通知失败:', error);
    res.status(500).json({
      message: '获取未读通知失败',
      error: error.message
    });
  }
};

// 标记通知为已读
exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json(notification);
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(400).json({
      message: error.message || '标记通知已读失败'
    });
  }
}; 