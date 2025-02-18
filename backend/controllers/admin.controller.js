const db = require("../models");
const User = db.User;
const Assessment = db.assessment;
const Appointment = db.appointment;
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 获取用户统计
    const totalUsers = await User.count();
    const lastMonthUsers = await User.count({
      where: {
        created_at: {
          [Op.lt]: firstDayOfMonth
        }
      }
    });
    const userGrowth = ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1);

    // 获取咨询师数量
    const totalCounselors = await User.count({
      where: { user_type: 'counselor' }
    });
    const lastMonthCounselors = await User.count({
      where: {
        user_type: 'counselor',
        created_at: {
          [Op.lt]: firstDayOfMonth
        }
      }
    });
    const counselorGrowth = ((totalCounselors - lastMonthCounselors) / lastMonthCounselors * 100).toFixed(1);

    // 获取本月预约数
    const monthlyAppointments = await Appointment.count({
      where: {
        created_at: {
          [Op.gte]: firstDayOfMonth
        }
      }
    });
    const lastMonthAppointments = await Appointment.count({
      where: {
        created_at: {
          [Op.gte]: firstDayOfLastMonth,
          [Op.lt]: firstDayOfMonth
        }
      }
    });
    const appointmentGrowth = ((monthlyAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(1);

    // 获取测评完成数
    const completedAssessments = await Assessment.count({
      where: {
        status: 'completed'
      }
    });
    const lastMonthCompletedAssessments = await Assessment.count({
      where: {
        status: 'completed',
        created_at: {
          [Op.lt]: firstDayOfMonth
        }
      }
    });
    const assessmentGrowth = ((completedAssessments - lastMonthCompletedAssessments) / lastMonthCompletedAssessments * 100).toFixed(1);

    // 获取最近活动
    const recentActivities = await Promise.all([
      // 最近注册的用户
      User.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['username', 'created_at', 'user_type']
      }),
      // 最近的预约
      Appointment.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['username']
          },
          {
            model: User,
            as: 'counselor',
            attributes: ['username']
          }
        ]
      }),
      // 最近完成的测评
      Assessment.findAll({
        where: { status: 'completed' },
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{
          model: User,
          attributes: ['username']
        }]
      })
    ]);

    // 格式化活动数据
    const activities = [];
    recentActivities[0].forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        icon: 'fas fa-user-plus',
        title: `新用户注册：${user.username}`,
        time: user.created_at
      });
    });

    recentActivities[1].forEach(appointment => {
      activities.push({
        id: `appointment-${appointment.id}`,
        type: 'appointment',
        icon: 'fas fa-calendar-check',
        title: `预约成功：${appointment.student.username} - ${appointment.counselor.username}`,
        time: appointment.created_at
      });
    });

    recentActivities[2].forEach(assessment => {
      activities.push({
        id: `assessment-${assessment.id}`,
        type: 'assessment',
        icon: 'fas fa-clipboard-check',
        title: `测评完成：${assessment.user.username}`,
        time: assessment.created_at
      });
    });

    // 时间排序并只返回最近的10条
    activities.sort((a, b) => b.time - a.time);
    activities.splice(10);

    // 获取预约趋势数据（最近6个月）
    const appointmentTrends = [];
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await Appointment.count({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      appointmentTrends.push({
        month: `${startDate.getMonth() + 1}月`,
        count
      });
    }

    res.json({
      stats: {
        totalUsers,
        userGrowth: parseFloat(userGrowth),
        monthlyAppointments,
        appointmentGrowth: parseFloat(appointmentGrowth),
        completedAssessments,
        assessmentGrowth: parseFloat(assessmentGrowth),
        totalCounselors,
        counselorGrowth: parseFloat(counselorGrowth)
      },
      activities,
      appointmentTrends,
      userDistribution: [
        {
          name: '学生',
          value: await User.count({ where: { user_type: 'student' } })
        },
        {
          name: '咨询师',
          value: totalCounselors
        },
        {
          name: '管理员',
          value: await User.count({ where: { user_type: 'admin' } })
        }
      ]
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    res.status(500).json({ message: "获取仪表盘数据失败" });
  }
};

// 获取所有用户列表
const getAllUsers = async (req, res) => {
  try {
    console.log('开始获取用户列表');
    const users = await User.findAll({
      attributes: ['id', 'username', 'user_type', 'real_name', 'email', 'phone', 'created_at', 'status']
    });
    console.log('查询结果:', users);
    
    // 转换字段名为驼峰命名（前端使用）
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      userType: user.user_type,
      realName: user.real_name,
      email: user.email,
      phone: user.phone,
      createdAt: user.created_at,
      status: user.status
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('获取用户列表失败，详细错误:', error);
    res.status(500).json({ 
      message: "获取用户列表失败",
      error: error.message 
    });
  }
};

// 更新用户信息
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { realName, email, phone } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    await user.update({
      real_name: realName,
      email,
      phone
    });

    res.json({ message: "用户信息更新成功" });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: "更新用户信息失败" });
  }
};

// 更新用户状态
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    await user.update({ status });
    res.json({ message: `用户状态已${status ? '启用' : '禁用'}` });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({ message: "更新用户状态失败" });
  }
};

// 重置用户密码
const resetUserPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    const hashedPassword = bcrypt.hashSync("123456", 8);
    await user.update({ password: hashedPassword });
    
    res.json({ message: "密码重置成功" });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ message: "重置密码失败" });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUser,
  updateUserStatus,
  resetUserPassword
}; 