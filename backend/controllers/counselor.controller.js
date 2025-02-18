const db = require("../models");
const User = db.User;
const Counselor = db.Counselor;
const CounselorSchedule = db.CounselorSchedule;
const { Op } = require("sequelize");

// 获取咨询师列表
exports.getCounselors = async (req, res) => {
  try {
    const { page = 1, limit = 9, keyword, expertise, rating } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    const include = [
      {
        model: User,
        as: 'user',
        attributes: ['username', 'real_name'],
        where: { status: true }
      }
    ];

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { expertise: { [Op.like]: `%${keyword}%` } },
        { introduction: { [Op.like]: `%${keyword}%` } },
        { '$user.real_name$': { [Op.like]: `%${keyword}%` } },
        { '$user.username$': { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (expertise) {
      where.expertise = { [Op.like]: `%${expertise}%` };
    }

    if (rating) {
      where.rating = { [Op.gte]: parseFloat(rating) };
    }

    where.status = 'available';  // 只查询可用的咨询师

    // 先获取总数
    const totalCount = await Counselor.count({
      where,
      include,
      distinct: true
    });

    // 获取分页数据
    const counselors = await Counselor.findAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      order: [['rating', 'DESC']]
    });

    res.json({
      data: counselors,
      total: totalCount,
      currentPage: parseInt(page),
      pageSize: parseInt(limit)
    });
  } catch (error) {
    console.error('获取咨询师列表失败:', error);
    res.status(500).json({ message: '获取咨询师列表失败' });
  }
};

// 获取咨询师详情
exports.getCounselorDetail = async (req, res) => {
  try {
    const counselorId = req.params.id;
    console.log('获取咨询师详情, ID:', counselorId);
    
    const counselor = await Counselor.findOne({
      where: { id: counselorId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'real_name', 'email', 'phone']
        }
      ]
    });
    console.log('查询结果:', JSON.stringify(counselor, null, 2));

    if (!counselor) {
      console.log('未找到咨询师');
      return res.status(404).json({ message: "咨询师不存在" });
    }

    console.log('返回咨询师详情:', JSON.stringify(counselor, null, 2));
    res.json(counselor);
  } catch (error) {
    console.error('获取咨询师详情失败:', error);
    res.status(500).json({ message: "获取咨询师详情失败" });
  }
};

// 获取咨询师可用时间段
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const counselorId = req.params.id;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "请指定开始和结束日期" });
    }

    const schedules = await CounselorSchedule.findAll({
      where: {
        counselor_id: counselorId,
        date: {
          [Op.between]: [startDate, endDate]
        },
        status: 'available'
      },
      order: [['date', 'ASC'], ['time_slot', 'ASC']]
    });

    res.json(schedules);
  } catch (error) {
    console.error('获取可用时间段失败:', error);
    res.status(500).json({ message: "获取可用时间段失败" });
  }
};

// 获取咨询师评价列表
exports.getCounselorReviews = async (req, res) => {
  try {
    const counselorId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 先获取咨询师对应的用户ID
    const counselor = await Counselor.findByPk(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: "咨询师不存在" });
    }

    const { count, rows } = await db.Appointment.findAndCountAll({
      where: {
        counselor_id: counselor.user_id,  // 使用咨询师的用户ID
        status: 'completed',
        rating: { [Op.not]: null }
      },
      attributes: ['id', 'rating', 'feedback', 'is_anonymous', 'created_at'],
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'real_name']
        }
      ],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    // 处理评价数据，匿名用户隐藏信息
    const reviews = rows.map(review => ({
      id: review.id,
      rating: review.rating,
      feedback: review.feedback,
      time: review.created_at,
      student: review.is_anonymous ? {
        username: '匿名用户',
        real_name: '匿名用户'
      } : review.student
    }));

    res.json({
      total: count,
      currentPage: page,
      pageSize: limit,
      data: reviews
    });
  } catch (error) {
    console.error('获取咨询师评价失败:', error);
    res.status(500).json({ message: "获取咨询师评价失败" });
  }
}; 