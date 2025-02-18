const db = require('../models');
const moment = require('moment');
const schedule = require('node-schedule');
const { Op } = require('sequelize');

class NotificationService {
  constructor() {
    this.initScheduledTasks();
    // 用于跟踪已发送的提醒
    this.sentReminders = new Map();
  }

  // 初始化定时任务
  initScheduledTasks() {
    // 每分钟检查一次需要发送的通知
    schedule.scheduleJob('*/1 * * * *', async () => {
      await this.checkAppointmentNotifications();
    });
  }

  // 检查预约相关的通知
  async checkAppointmentNotifications() {
    try {
      const now = moment();
      console.log('当前时间:', now.format('YYYY-MM-DD HH:mm'));

      // 获取未来24小时内的预约（使用clone避免修改原始now对象）
      const appointments = await db.Appointment.findAll({
        where: {
          status: 'confirmed',
          '$schedule.date$': {
            [Op.between]: [
              now.format('YYYY-MM-DD'),
              now.clone().add(1, 'days').format('YYYY-MM-DD')
            ]
          }
        },
        include: [{
          model: db.CounselorSchedule,
          as: 'schedule',
          required: true
        }]
      });

      for (const appointment of appointments) {
        const startTime = moment(`${appointment.schedule.date} ${appointment.schedule.time_slot.split('-')[0]}`, 'YYYY-MM-DD HH:mm');
        console.log('预约开始时间:', startTime.format('YYYY-MM-DD HH:mm'));

        // 正确计算时间差：用当前时间到预约时间的分钟数
        const minutesToAppointment = startTime.diff(moment(now), 'minutes');
        console.log('距离预约时间还有分钟数:', minutesToAppointment);

        // 24小时提醒 (1440±1分钟)
        if (minutesToAppointment >= 1439 && minutesToAppointment <= 1441) {
          const reminderKey = `24hr_${appointment.id}`;
          if (!this.sentReminders.has(reminderKey)) {
            console.log('发送24小时提醒通知');
            await this.createAppointmentReminder(appointment, '24小时');
            this.sentReminders.set(reminderKey, now.valueOf());
            // 24小时后自动删除提醒记录
            setTimeout(() => this.sentReminders.delete(reminderKey), 24 * 60 * 60 * 1000);
          }
        }

        // 1小时提醒 (60±1分钟)
        if (minutesToAppointment >= 59 && minutesToAppointment <= 61) {
          const reminderKey = `1hr_${appointment.id}`;
          if (!this.sentReminders.has(reminderKey)) {
            console.log('发送1小时提醒通知');
            await this.createAppointmentReminder(appointment, '1小时');
            this.sentReminders.set(reminderKey, now.valueOf());
            // 24小时后自动删除提醒记录
            setTimeout(() => this.sentReminders.delete(reminderKey), 24 * 60 * 60 * 1000);
          }
        }
      }
    } catch (error) {
      console.error('检查预约通知失败:', error);
    }
  }

  // 创建预约提醒通知
  async createAppointmentReminder(appointment, timeText) {
    try {
      // 为学生创建提醒
      await this.createNotification({
        user_id: appointment.student_id,
        title: '预约提醒',
        content: `您有一个预约将在${timeText}后开始，请准时参加咨询。`,
        type: 'appointment',
        related_id: appointment.id
      });

      // 为咨询师创建提醒
      await this.createNotification({
        user_id: appointment.counselor_id,
        title: '预约提醒',
        content: `您有一个预约将在${timeText}后开始，请做好准备。`,
        type: 'appointment',
        related_id: appointment.id
      });
    } catch (error) {
      console.error('创建预约提醒失败:', error);
    }
  }

  // 创建通知
  async createNotification(data) {
    try {
      const notification = await db.Notification.create(data);
      return notification;
    } catch (error) {
      console.error('创建通知失败:', error);
      throw error;
    }
  }

  // 获取用户的未读通知
  async getUnreadNotifications(userId) {
    try {
      console.log('开始获取未读通知，用户ID:', userId);
      
      const user = await db.User.findByPk(userId);
      if (!user) {
        console.error('用户不存在，用户ID:', userId);
        throw new Error('用户不存在');
      }
      
      console.log('找到用户:', user.username);

      const notifications = await db.Notification.findAll({
        where: {
          user_id: userId,
          is_read: false
        },
        order: [['created_at', 'DESC']]
      });
      
      console.log('查询到的未读通知数量:', notifications.length);

      // 为每个通知添加用户类型信息
      const notificationsWithUserType = notifications.map(notification => {
        const notificationData = {
          ...notification.toJSON(),
          user_type: user.user_type
        };
        console.log('处理后的通知数据:', notificationData);
        return notificationData;
      });

      console.log('返回的通知数组长度:', notificationsWithUserType.length);
      return notificationsWithUserType;
    } catch (error) {
      console.error('获取未读通知失败:', error);
      // 返回空数组而不是抛出错误，这样前端始终能收到一个数组
      return [];
    }
  }

  // 标记通知为已读
  async markAsRead(notificationId, userId) {
    try {
      const notification = await db.Notification.findOne({
        where: {
          id: notificationId,
          user_id: userId
        }
      });

      if (!notification) {
        throw new Error('通知不存在');
      }

      await notification.update({ is_read: true });
      return notification;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw error;
    }
  }

  // 创建预约状态变更通知
  async createAppointmentStatusNotification(appointment, status, reason = '') {
    try {
      let title = '';
      let content = '';

      switch (status) {
        case 'pending':
          // 新预约通知发送给咨询师
          await this.createNotification({
            user_id: appointment.counselor_id,
            title: '新预约请求',
            content: `您收到一个新的预约请求，请及时处理。`,
            type: 'appointment',
            related_id: appointment.id
          });
          break;

        case 'confirmed':
          title = '预约已确认';
          content = '您的预约已被咨询师确认。';
          if (appointment.type === 'online' && appointment.online_meeting_url) {
            content += ` 会议链接：${appointment.online_meeting_url}`;
          } else if (appointment.type === 'offline' && appointment.room_number) {
            content += ` 咨询室：${appointment.room_number}`;
          }
          // 只通知学生
          await this.createNotification({
            user_id: appointment.student_id,
            title,
            content,
            type: 'appointment',
            related_id: appointment.id
          });
          break;

        case 'cancelled':
          if (appointment.cancelled_by === 'counselor') {
            // 咨询师取消/拒绝，只通知学生
            await this.createNotification({
              user_id: appointment.student_id,
              title: '预约已被拒绝',
              content: `预约已被咨询师拒绝${reason ? '，原因：' + reason : ''}`,
              type: 'appointment',
              related_id: appointment.id
            });
          } else if (appointment.cancelled_by === 'student') {
            // 学生取消，只通知咨询师
            await this.createNotification({
              user_id: appointment.counselor_id,
              title: '预约已取消',
              content: `学生已取消预约${reason ? '，原因：' + reason : ''}`,
              type: 'appointment',
              related_id: appointment.id
            });
          }
          break;

        case 'completed':
          // 咨询完成后通知学生进行评价
          await this.createNotification({
            user_id: appointment.student_id,
            title: '咨询已完成',
            content: '您的咨询已完成，请对本次咨询进行评价，帮助我们提供更好的服务。',
            type: 'appointment',
            related_id: appointment.id
          });

          // 提醒咨询师填写咨询记录
          await this.createNotification({
            user_id: appointment.counselor_id,
            title: '请填写咨询记录',
            content: '咨询已完成，请及时填写咨询记录，记录本次咨询的内容和建议。',
            type: 'appointment',
            related_id: appointment.id
          });
          break;
      }
    } catch (error) {
      console.error('创建预约状态通知失败:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 