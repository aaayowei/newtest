const schedule = require('node-schedule');
const db = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const notificationService = require('./notification.service');

class AppointmentService {
  constructor() {
    this.initScheduledTasks();
  }

  // 初始化定时任务
  initScheduledTasks() {
    // 每分钟检查一次预约状态
    schedule.scheduleJob('*/1 * * * *', async () => {
      await this.updateAppointmentStatuses();
    });
  }

  // 更新预约状态
  async updateAppointmentStatuses() {
    try {
      const now = moment();

      // 1. 更新已过期未确认的预约为已取消
      await this.cancelExpiredPendingAppointments(now);

      // 2. 更新已完成的预约状态
      await this.completeFinishedAppointments(now);

    } catch (error) {
      console.error('更新预约状态失败:', error);
    }
  }

  // 取消已过期未确认的预约
  async cancelExpiredPendingAppointments(now) {
    try {
      const expiredAppointments = await db.Appointment.findAll({
        where: {
          status: 'pending',
          '$schedule.date$': {
            [Op.lte]: now.format('YYYY-MM-DD')
          }
        },
        include: [{
          model: db.CounselorSchedule,
          as: 'schedule',
          required: true
        }]
      });

      for (const appointment of expiredAppointments) {
        const scheduleStartTime = moment(`${appointment.schedule.date} ${appointment.schedule.time_slot.split('-')[0]}`, 'YYYY-MM-DD HH:mm');
        
        // 如果当前时间已经超过预约开始时间，则取消预约
        if (now.isAfter(scheduleStartTime)) {
          await appointment.update({
            status: 'cancelled',
            cancel_reason: '预约已过期未确认',
            cancelled_by: 'system',
            cancelled_at: now.toDate()
          });

          // 恢复排班状态
          await appointment.schedule.update({ status: 'available' });
        }
      }
    } catch (error) {
      console.error('取消过期预约失败:', error);
    }
  }

  // 更新已完成的预约状态
  async completeFinishedAppointments(now) {
    try {
      const appointments = await db.Appointment.findAll({
        where: {
          status: 'confirmed',
          '$schedule.date$': {
            [Op.lte]: now.format('YYYY-MM-DD')
          }
        },
        include: [{
          model: db.CounselorSchedule,
          as: 'schedule',
          required: true
        }]
      });

      for (const appointment of appointments) {
        const scheduleEndTime = moment(`${appointment.schedule.date} ${appointment.schedule.time_slot.split('-')[1]}`, 'YYYY-MM-DD HH:mm');
        
        // 如果当前时间已经超过预约结束时间，则标记为已完成
        if (now.isAfter(scheduleEndTime)) {
          await appointment.update({
            status: 'completed'
          });
          
          // 发送完成通知和评价提醒
          await notificationService.createAppointmentStatusNotification(appointment, 'completed');
        }
      }
    } catch (error) {
      console.error('更新已完成预约失败:', error);
    }
  }

  // 检查是否可以取消预约
  async canCancelAppointment(appointment) {
    // 如果预约已经被取消或已完成，不能取消
    if (['cancelled', 'completed'].includes(appointment.status)) {
      throw new Error('该预约已不能取消');
    }

    // 如果预约已确认且已分配咨询室/聊天室，不能取消
    if (appointment.status === 'confirmed' && 
        (appointment.room_number || appointment.online_meeting_url)) {
      throw new Error('咨询师已确认预约，不能取消预约');
    }

    // 检查是否在预约时间12小时前
    const appointmentTime = moment(`${appointment.schedule.date} ${appointment.schedule.time_slot.split('-')[0]}`, 'YYYY-MM-DD HH:mm');
    const now = moment();
    const hoursDiff = appointmentTime.diff(now, 'hours');

    if (hoursDiff < 12) {
      throw new Error('预约时间不足12小时，不能取消');
    }

    return true;
  }
}

module.exports = new AppointmentService(); 