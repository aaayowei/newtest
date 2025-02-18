const db = require("../models");
const { Op } = require("sequelize");

exports.getOverviewStats = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    
    // 添加日期格式转换和验证
    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      
      // 验证日期是否有效
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "无效的日期格式" });
      }

      // 调整日期范围到当天的开始和结束
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // 获取基础统计数据
    const stats = await Promise.all([
      // 总测评数
      db.Assessment.count({
        where: startDate && endDate ? {
          created_at: { [Op.between]: [startDate, endDate] }
        } : {}
      }),
      // 总预约数
      db.Appointment.count({
        where: startDate && endDate ? {
          created_at: { [Op.between]: [startDate, endDate] }
        } : {}
      })
    ]);

    // 计算环比增长
    let prevStartDate = null;
    let prevEndDate = null;
    
    if (startDate && endDate) {
      const timeSpan = endDate.getTime() - startDate.getTime();
      prevStartDate = new Date(startDate.getTime() - timeSpan);
      prevEndDate = new Date(endDate.getTime() - timeSpan);
    }

    const prevStats = await Promise.all([
      db.Assessment.count({
        where: prevStartDate && prevEndDate ? {
          created_at: { [Op.between]: [prevStartDate, prevEndDate] }
        } : {}
      }),
      db.Appointment.count({
        where: prevStartDate && prevEndDate ? {
          created_at: { [Op.between]: [prevStartDate, prevEndDate] }
        } : {}
      })
    ]);

    // 计算增长率
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return 0;
      return Number(((current - previous) / previous * 100).toFixed(2));
    };

    res.json({
      overview: {
        totalAssessments: {
          value: stats[0],
          trend: calculateGrowth(stats[0], prevStats[0])
        },
        totalAppointments: {
          value: stats[1],
          trend: calculateGrowth(stats[1], prevStats[1])
        }
      }
    });
  } catch (error) {
    console.error('Error in getOverviewStats:', error);
    res.status(500).json({ 
      message: "获取统计数据失败",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

exports.getAssessmentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = startDate && endDate ? {
      created_at: { [Op.between]: [startDate, endDate] }
    } : {};

    // 获取测评类型分布
    const typeDistribution = await db.Assessment.findAll({
      where: whereClause,
      attributes: [
        'type',
        [db.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['type']
    });

    // 获取测评等级分布
    const levelDistribution = await db.Assessment.findAll({
      where: whereClause,
      attributes: [
        [db.sequelize.literal(`JSON_EXTRACT(result, '$.level')`), 'level'],
        [db.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [db.sequelize.literal(`JSON_EXTRACT(result, '$.level')`)]
    });

    // 获取每月测评数量趋势
    const monthlyTrend = await db.Assessment.findAll({
      where: whereClause,
      attributes: [
        [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('created_at'), '%Y-%m'), 'month'],
        [db.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('created_at'), '%Y-%m')],
      order: [[db.sequelize.literal('month'), 'ASC']]
    });

    res.json({
      typeDistribution,
      levelDistribution,
      monthlyTrend
    });
  } catch (error) {
    console.error('Error in getAssessmentStats:', error);
    res.status(500).json({ message: "获取测评统计失败" });
  }
};

exports.getAppointmentTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = startDate && endDate ? {
      created_at: { [Op.between]: [startDate, endDate] }
    } : {};

    // 获取预约趋势数据
    const trends = await db.Appointment.findAll({
      where: whereClause,
      attributes: [
        [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('created_at'), '%Y-%m-%d'), 'date'],
        [db.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('created_at'), '%Y-%m-%d')],
      order: [[db.sequelize.literal('date'), 'ASC']]
    });

    // 获取预约状态分布
    const statusDistribution = await db.Appointment.findAll({
      where: whereClause,
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    res.json({
      trends,
      statusDistribution
    });
  } catch (error) {
    console.error('Error in getAppointmentTrends:', error);
    res.status(500).json({ message: "获取预约趋势失败" });
  }
}; 