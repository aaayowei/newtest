const db = require("../models");
const Appointment = db.Appointment;
const User = db.User;
const CounselorSchedule = db.CounselorSchedule;
const { Op } = require("sequelize");
const appointmentService = require('../services/appointment.service');
const notificationService = require('../services/notification.service');

// 创建预约
exports.createAppointment = async (req, res) => {
  try {
    const { counselor_id, schedule_id, type, description, is_anonymous } = req.body;
    const student_id = req.user.id;

    console.log('创建预约请求数据:', {
      counselor_id,
      schedule_id,
      type,
      description,
      is_anonymous,
      student_id
    });

    // 获取排班信息
    const schedule = await CounselorSchedule.findByPk(schedule_id);
    console.log('查询到的排班信息:', schedule);
    if (!schedule) {
      return res.status(404).json({ message: "未找到预约时间段" });
    }
    if (schedule.status !== 'available') {
      return res.status(400).json({ message: "该时间段已被预约" });
    }

    // 获取咨询师信息
    const counselor = await db.Counselor.findByPk(counselor_id);
    console.log('查询到的咨询师信息:', counselor);
    if (!counselor) {
      return res.status(404).json({ message: "未找到咨询师信息" });
    }

    // 创建预约
    const appointmentData = {
      student_id,
      counselor_id: counselor.user_id,
      schedule_id,
      type,
      description,
      is_anonymous: !!is_anonymous
    };
    console.log('准备创建的预约数据:', appointmentData);

    const appointment = await Appointment.create(appointmentData);
    console.log('创建的预约结果:', appointment);

    // 更新排班状态
    await schedule.update({ status: 'booked' });

    // 发送预约创建通知
    await notificationService.createAppointmentStatusNotification(appointment, 'pending');

    res.status(201).json(appointment);
  } catch (error) {
    console.error('创建预约失败，详细错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      message: "创建预约失败",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 获取预约列表
exports.getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
    const userType = req.user.user_type;

    console.log('获取预约列表请求参数:', {
      page,
      limit,
      status,
      user_id: userId,
      user_type: userType,
      offset
    });

    // 构建查询条件
    const where = {};
    if (userType === 'student') {
      where.student_id = userId;
    } else if (userType === 'counselor') {
      where.counselor_id = userId;
    }
    if (status) {
      where.status = status;
    }

    console.log('数据库查询条件:', where);

    // 获取总记录数
    const count = await db.Appointment.count({ where });

    // 获取分页数据
    const appointments = await db.Appointment.findAll({
      where,
      include: [
        {
          model: db.User,
          as: 'student',
          attributes: ['id', 'username', 'real_name']
        },
        {
          model: db.User,
          as: 'counselor',
          attributes: ['id', 'username', 'real_name']
        },
        {
          model: db.CounselorSchedule,
          as: 'schedule',
          attributes: ['id', 'date', 'time_slot']
        }
      ],
      order: [['created_at', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(limit)
    });

    console.log('数据库查询结果:', {
      '总记录数': count,
      '当前页数据条数': appointments.length,
      '偏移量': offset,
      '每页条数': limit
    });

    // 序列化数据
    const serializedAppointments = appointments.map(appointment => appointment.toJSON());

    // 返回标准的分页数据结构
    const result = {
      total: count,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      data: serializedAppointments
    };

    console.log('返回给前端的数据结构:', {
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      dataLength: result.data.length,
      isArray: Array.isArray(result.data),
      resultType: typeof result
    });

    // 确保返回的是一个对象而不是数组
    return res.json({
      ...result,
      data: result.data
    });
  } catch (error) {
    console.error('获取预约列表失败:', error);
    res.status(500).json({ message: '获取预约列表失败' });
  }
};

// 获取预约详情
exports.getAppointmentDetail = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    console.log('获取预约详情请求，ID:', appointmentId);
    console.log('当前用户信息:', { id: req.user.id, type: req.user.user_type });

    const appointment = await Appointment.findOne({
      where: { id: appointmentId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'real_name', 'email', 'phone']
        },
        {
          model: User,
          as: 'counselor',
          attributes: ['id', 'username', 'real_name', 'email', 'phone']
        },
        {
          model: CounselorSchedule,
          as: 'schedule',
          attributes: ['date', 'time_slot']
        }
      ]
    });

    console.log('数据库查询结果:', JSON.stringify(appointment, null, 2));

    if (!appointment) {
      console.log('未找到预约记录');
      return res.status(404).json({ message: "预约不存在" });
    }

    // 检查权限
    const user_id = req.user.id;
    const user_type = req.user.user_type;
    
    console.log('权限检查:', {
      appointment_student_id: appointment.student_id,
      appointment_counselor_id: appointment.counselor_id,
      user_id,
      user_type
    });

    if (user_type === 'student' && appointment.student_id !== user_id) {
      console.log('学生权限检查失败');
      return res.status(403).json({ message: "无权访问此预约" });
    }
    if (user_type === 'counselor' && appointment.counselor_id !== user_id) {
      console.log('咨询师权限检查失败');
      return res.status(403).json({ message: "无权访问此预约" });
    }

    // 处理返回数据
    const result = {
      ...appointment.toJSON(),
      date: appointment.schedule.date,
      time_slot: appointment.schedule.time_slot
    };

    console.log('返回给前端的数据:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('获取预约详情失败，详细错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      message: "获取预约详情失败",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 更新预约状态
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, room_number, cancel_reason } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [{
        model: db.CounselorSchedule,
        as: 'schedule',
        required: true
      }]
    });

    if (!appointment) {
      return res.status(404).json({
        message: "预约不存在"
      });
    }

    // 准备更新数据
    const updateData = {
      status,
      cancel_reason,
      cancelled_by: req.user.user_type === 'student' ? 'student' : 'counselor',
      cancelled_at: status === 'cancelled' ? new Date() : null
    };

    // 处理确认预约的情况
    if (status === 'confirmed') {
      // 线下预约必须提供咨询室
      if (appointment.type === 'offline') {
        if (!room_number) {
          return res.status(400).json({ message: "线下预约必须指定咨询室" });
        }
        updateData.room_number = room_number;
      } 
      // 线上预约自动生成聊天室ID
      else if (appointment.type === 'online') {
        // 使用预约ID和时间戳生成唯一的聊天室ID
        const chatRoomId = `chat_${appointment.id}_${Date.now()}`;
        updateData.online_meeting_url = chatRoomId;
      }
    }

    // 更新预约状态
    await appointment.update(updateData);

    // 如果是取消预约，恢复排班状态
    if (status === 'cancelled') {
      await appointment.schedule.update({ status: 'available' });
    }

    // 发送通知
    await notificationService.createAppointmentStatusNotification(
      appointment,
      status,
      cancel_reason
    );

    res.json({
      message: "预约状态已更新",
      appointment
    });
  } catch (error) {
    console.error('更新预约状态失败:', error);
    res.status(500).json({
      message: "更新预约状态失败",
      error: error.message
    });
  }
};

// 提交评价
exports.submitReview = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "预约不存在" });
    }

    // 检查权限
    if (appointment.student_id !== req.user.id) {
      return res.status(403).json({ message: "无权评价此预约" });
    }

    // 检查预约状态
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: "只能评价已完成的预约" });
    }

    // 检查是否已评价
    if (appointment.rating !== null) {
      return res.status(400).json({ message: "已经评价过了" });
    }

    // 更新评价
    await appointment.update({
      rating,
      feedback
    });

    res.json(appointment);
  } catch (error) {
    console.error('提交评价失败:', error);
    res.status(500).json({ message: "提交评价失败" });
  }
};

// 分配咨询地点/链接
exports.assignAppointmentLocation = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { room_number, online_meeting_url } = req.body;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: User,
          as: 'counselor',
          attributes: ['id', 'username', 'real_name']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'real_name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: "预约不存在" });
    }

    // 验证当前用户是否为该预约的咨询师
    if (appointment.counselor_id !== req.user.id) {
      return res.status(403).json({ message: "无权操作此预约" });
    }

    // 只能为已确认的预约分配地点
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: "只能为已确认的预约分配咨询地点" });
    }

    // 根据咨询类型验证必要字段
    if (appointment.type === 'online' && !online_meeting_url) {
      return res.status(400).json({ message: "线上咨询必须提供会议链接" });
    }
    if (appointment.type === 'offline' && !room_number) {
      return res.status(400).json({ message: "线下咨询必须提供咨询室房间号" });
    }

    // 更新预约信息
    await appointment.update({
      room_number: room_number || null,
      online_meeting_url: online_meeting_url || null
    });

    // 返回更新后的预约信息
    res.json({
      message: "咨询地点分配成功",
      data: appointment
    });

  } catch (error) {
    console.error('分配咨询地点失败:', error);
    res.status(500).json({ message: "分配咨询地点失败" });
  }
};

// 获取预约相关用户信息
exports.getAppointmentUsers = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const userId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { id: appointmentId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'real_name']
        },
        {
          model: User,
          as: 'counselor',
          attributes: ['id', 'username', 'real_name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "预约不存在"
      });
    }

    // 检查权限
    if (userId !== appointment.student_id && userId !== appointment.counselor_id) {
      return res.status(403).json({
        success: false,
        message: "无权访问此预约信息"
      });
    }

    // 确定当前用户和对方用户
    const currentUser = userId === appointment.student_id ? appointment.student : appointment.counselor;
    const otherUser = userId === appointment.student_id ? appointment.counselor : appointment.student;

    // 处理匿名预约
    const isAnonymous = appointment.is_anonymous;
    
    // 获取当前用户的显示名称
    let currentUserName = currentUser.real_name || currentUser.username;

    // 获取对方用户的显示名称
    let otherUserName;
    if (userId === appointment.counselor_id && isAnonymous) {
      // 如果当前用户是咨询师且是匿名预约，则学生显示为匿名用户
      otherUserName = '匿名用户';
    } else {
      otherUserName = otherUser.real_name || otherUser.username;
    }

    res.json({
      success: true,
      currentUser: {
        id: currentUser.id,
        name: currentUserName
      },
      otherUser: {
        id: otherUser.id,
        name: otherUserName
      },
      isAnonymous: isAnonymous
    });
  } catch (error) {
    console.error('获取预约用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: "获取预约用户信息失败"
    });
  }
};

// 检查预约是否可以取消
exports.checkCancellable = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await db.Appointment.findByPk(appointmentId, {
      include: [{
        model: db.CounselorSchedule,
        as: 'schedule',
        required: true
      }]
    });

    if (!appointment) {
      return res.status(404).json({
        message: '预约不存在'
      });
    }

    // 检查是否是当前用户的预约
    if (appointment.student_id !== req.user.id) {
      return res.status(403).json({
        message: '无权操作此预约'
      });
    }

    // 检查是否可以取消
    await appointmentService.canCancelAppointment(appointment);

    res.json({
      message: '可以取消预约'
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

// 取消预约
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { reason } = req.body;

    const appointment = await db.Appointment.findByPk(appointmentId, {
      include: [{
        model: db.CounselorSchedule,
        as: 'schedule',
        required: true
      }]
    });

    if (!appointment) {
      return res.status(404).json({
        message: '预约不存在'
      });
    }

    // 检查是否是当前用户的预约
    if (appointment.student_id !== req.user.id) {
      return res.status(403).json({
        message: '无权操作此预约'
      });
    }

    // 检查是否可以取消
    await appointmentService.canCancelAppointment(appointment);

    // 更新预约状态
    await appointment.update({
      status: 'cancelled',
      cancel_reason: reason,
      cancelled_by: 'student',
      cancelled_at: new Date()
    });

    // 恢复排班状态
    await appointment.schedule.update({ status: 'available' });

    res.json({
      message: '预约已取消',
      appointment
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

// 提交咨询记录
exports.submitNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "预约不存在" });
    }

    // 检查权限
    if (appointment.counselor_id !== req.user.id) {
      return res.status(403).json({ message: "无权提交此预约的咨询记录" });
    }

    // 检查预约状态
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: "只能为已完成的预约添加咨询记录" });
    }

    // 检查是否已有咨询记录
    if (appointment.notes) {
      return res.status(400).json({ message: "已经提交过咨询记录" });
    }

    // 更新咨询记录
    await appointment.update({ notes });

    res.json(appointment);
  } catch (error) {
    console.error('提交咨询记录失败:', error);
    res.status(500).json({ message: "提交咨询记录失败" });
  }
};