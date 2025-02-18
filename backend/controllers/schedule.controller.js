const db = require("../models");
const { Op } = require("sequelize");
const Counselor = db.Counselor;
const CounselorSchedule = db.CounselorSchedule;
const Appointment = db.Appointment;
const User = db.User;

// 获取咨询师排班列表
exports.getSchedules = async (req, res) => {
  try {
    const { year, month, counselorId } = req.query;

    // 获取咨询师信息
    const counselor = await Counselor.findOne({
      where: { id: counselorId }
    });

    if (!counselor) {
      return res.status(404).json({ message: "咨询师信息不存在" });
    }

    // 构建日期范围
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 获取排班信息
    const schedules = await CounselorSchedule.findAll({
      where: {
        counselor_id: counselor.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Appointment,
          as: 'appointment',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'real_name']
            }
          ]
        }
      ],
      order: [
        ['date', 'ASC'],
        ['time_slot', 'ASC']
      ]
    });

    res.json({
      data: schedules,
      total: schedules.length
    });
  } catch (error) {
    console.error('获取排班列表失败:', error);
    res.status(500).json({ message: "获取排班列表失败" });
  }
};

// 添加排班
exports.addSchedules = async (req, res) => {
  try {
    const { counselorId, date, timeSlots } = req.body;

    // 获取咨询师信息
    const counselor = await Counselor.findOne({
      where: { id: counselorId }
    });

    if (!counselor) {
      return res.status(404).json({ message: "咨询师信息不存在" });
    }

    // 检查日期是否是过去的日期
    const scheduleDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
      return res.status(400).json({ message: "不能为过去的日期排班" });
    }

    // 检查时间段是否已存在
    const existingSchedules = await CounselorSchedule.findAll({
      where: {
        counselor_id: counselor.id,
        date: date,
        time_slot: {
          [Op.in]: timeSlots
        }
      }
    });

    if (existingSchedules.length > 0) {
      return res.status(400).json({ message: "部分时间段已存在排班" });
    }

    // 创建排班记录
    const schedules = await Promise.all(
      timeSlots.map(timeSlot =>
        CounselorSchedule.create({
          counselor_id: counselor.id,
          date,
          time_slot: timeSlot,
          status: 'available'
        })
      )
    );

    res.json({
      message: "添加排班成功",
      data: schedules
    });
  } catch (error) {
    console.error('添加排班失败:', error);
    res.status(500).json({ message: "添加排班失败" });
  }
};

// 批量添加排班
exports.batchAddSchedules = async (req, res) => {
  try {
    const { counselorId, startDate, endDate, workdays, timeSlots } = req.body;

    // 获取咨询师信息
    const counselor = await Counselor.findOne({
      where: { id: counselorId }
    });

    if (!counselor) {
      return res.status(404).json({ message: "咨询师信息不存在" });
    }

    // 检查日期范围
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: "开始日期不能是过去的日期" });
    }

    if (end < start) {
      return res.status(400).json({ message: "结束日期不能早于开始日期" });
    }

    // 生成日期列表
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      if (workdays.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    // 检查时间段是否已存在
    const existingSchedules = await CounselorSchedule.findAll({
      where: {
        counselor_id: counselor.id,
        date: {
          [Op.in]: dates
        },
        time_slot: {
          [Op.in]: timeSlots
        }
      }
    });

    if (existingSchedules.length > 0) {
      return res.status(400).json({ message: "部分时间段已存在排班" });
    }

    // 创建排班记录
    const schedules = [];
    for (const date of dates) {
      for (const timeSlot of timeSlots) {
        schedules.push({
          counselor_id: counselor.id,
          date,
          time_slot: timeSlot,
          status: 'available'
        });
      }
    }

    await CounselorSchedule.bulkCreate(schedules);

    res.json({
      message: "批量添加排班成功",
      data: {
        totalDates: dates.length,
        totalSchedules: schedules.length
      }
    });
  } catch (error) {
    console.error('批量添加排班失败:', error);
    res.status(500).json({ message: "批量添加排班失败" });
  }
};

// 取消排班
exports.cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // 获取排班信息
    const schedule = await CounselorSchedule.findOne({
      where: { id }
    });

    if (!schedule) {
      return res.status(404).json({ message: "排班记录不存在" });
    }

    if (schedule.status !== 'available') {
      return res.status(400).json({ message: "该时间段已被预约,无法取消" });
    }

    // 检查是否是过去的日期
    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
      return res.status(400).json({ message: "不能取消过去的排班" });
    }

    // 删除排班记录
    await schedule.destroy();

    res.json({ message: "取消排班成功" });
  } catch (error) {
    console.error('取消排班失败:', error);
    res.status(500).json({ message: "取消排班失败" });
  }
};

// 获取咨询师自己的排班
exports.getMyCounselorSchedules = async (req, res) => {
  try {
    const { year, month } = req.query;
    const counselorId = req.user.id;

    // 获取咨询师信息
    const counselor = await Counselor.findOne({
      where: { user_id: counselorId }
    });

    if (!counselor) {
      return res.status(404).json({ message: "咨询师信息不存在" });
    }

    // 构建日期范围
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 获取排班信息
    const schedules = await CounselorSchedule.findAll({
      where: {
        counselor_id: counselor.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Appointment,
          as: 'appointment',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'real_name']
            }
          ]
        }
      ],
      order: [
        ['date', 'ASC'],
        ['time_slot', 'ASC']
      ]
    });

    res.json({
      data: schedules,
      total: schedules.length
    });
  } catch (error) {
    console.error('获取排班列表失败:', error);
    res.status(500).json({ message: "获取排班列表失败" });
  }
}; 