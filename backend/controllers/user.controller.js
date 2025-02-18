const db = require("../models");
const User = db.User;
const Student = db.Student;
const Counselor = db.Counselor;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const fs = require('fs');
const path = require('path');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    // 创建用户
    const user = await User.create({
      username,
      password: bcrypt.hashSync(password, 8),
      user_type: userType,
      status: true
    });

    res.json({ message: "用户注册成功！" });
  } catch (err) {
    console.error('注册失败:', err);
    res.status(500).json({ message: err.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    const user = await User.findOne({
      where: {
        username,
        user_type: userType
      }
    });

    if (!user) {
      return res.status(404).json({ message: "用户不存在！" });
    }

    if (!user.status) {
      return res.status(403).json({ message: "账号已被禁用！" });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "密码错误！" });
    }

    const token = jwt.sign(
      { id: user.id, userType: user.user_type },
      config.secret,
      { expiresIn: 86400 } // 24 hours
    );

    res.json({
      id: user.id,
      username: user.username,
      userType: user.user_type,
      realName: user.real_name,
      email: user.email,
      phone: user.phone,
      accessToken: token
    });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ message: err.message });
  }
};

// 检查用户名是否存在
exports.checkUsername = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('检查用户名失败:', err);
    res.status(500).json({ message: err.message });
  }
};

// 获取用户个人信息
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    console.log('获取用户信息，用户ID:', userId, '用户类型:', userType);

    // 根据用户类型选择不同的 include
    let includeModel = [];
    if (userType === 'student') {
      includeModel = [{
        model: Student,
        as: 'student_profile',
        attributes: ['student_id', 'department', 'major', 'grade', 'class_name']
      }];
    } else if (userType === 'counselor') {
      includeModel = [{
        model: Counselor,
        as: 'counselor_profile',
        attributes: [
          'title', 'expertise', 'introduction', 'education', 'avatar',
          'consultation_count', 'rating', 'satisfaction_rate'
        ]
      }];
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'real_name', 'email', 'phone', 'gender', 'user_type'],
      include: includeModel
    });

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    console.log('查询到的用户数据:', JSON.stringify(user, null, 2));

    // 构造响应数据
    const userData = {
      id: user.id,
      username: user.username,
      realName: user.real_name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      userType: user.user_type
    };

    // 根据用户类型添加特有信息
    if (userType === 'student' && user.student_profile) {
      userData.student_profile = {
        student_id: user.student_profile.student_id,
        department: user.student_profile.department,
        major: user.student_profile.major,
        grade: user.student_profile.grade,
        class_name: user.student_profile.class_name
      };
    } else if (userType === 'counselor' && user.counselor_profile) {
      userData.counselor_profile = {
        title: user.counselor_profile.title,
        expertise: user.counselor_profile.expertise,
        introduction: user.counselor_profile.introduction,
        education: user.counselor_profile.education,
        avatar: user.counselor_profile.avatar,
        consultation_count: user.counselor_profile.consultation_count,
        rating: user.counselor_profile.rating,
        satisfaction_rate: user.counselor_profile.satisfaction_rate
      };
    }

    console.log('返回的用户数据:', JSON.stringify(userData, null, 2));

    res.json(userData);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: "获取用户信息失败"
    });
  }
};

// 更新用户个人信息
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { realName, gender, email, phone, counselor_profile, student_profile } = req.body;

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUserWithEmail = await db.User.findOne({
        where: {
          email: email,
          id: { [db.Sequelize.Op.ne]: userId }
        }
      });
      if (existingUserWithEmail) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被其他用户使用'
        });
      }
    }

    // 检查手机号是否已被其他用户使用
    if (phone) {
      const existingUserWithPhone = await db.User.findOne({
        where: {
          phone: phone,
          id: { [db.Sequelize.Op.ne]: userId }
        }
      });
      if (existingUserWithPhone) {
        return res.status(400).json({
          success: false,
          message: '该手机号已被其他用户使用'
        });
      }
    }

    // 更新用户基本信息
    await db.User.update(
      { 
        real_name: realName,  // 确保使用正确的字段名 real_name
        gender, 
        email, 
        phone 
      },
      { where: { id: userId } }
    );

    // 如果是咨询师，更新或创建咨询师信息
    if (req.user.user_type === 'counselor' && counselor_profile) {
      const [counselor] = await db.Counselor.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          ...counselor_profile,
          consultation_count: 0,
          rating: 0,
          satisfaction_rate: 100.0,
          status: 'available'
        }
      });

      if (counselor) {
        await counselor.update(counselor_profile);
      }
    }

    // 如果是学生，更新或创建学生信息
    if (req.user.user_type === 'student' && student_profile) {
      const [student] = await db.Student.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          ...student_profile
        }
      });

      if (student) {
        await student.update(student_profile);
      }
    }

    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
    if (!passwordIsValid) {
      return res.status(400).json({ message: "原密码错误" });
    }

    await User.update({
      password: bcrypt.hashSync(newPassword, 8)
    }, {
      where: { id: userId }
    });

    res.json({ message: "密码修改成功" });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ message: "修改密码失败" });
  }
};

// 上传头像
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的头像'
      });
    }

    // 构造头像URL（使用相对路径）
    const avatarPath = `/avatars/${req.file.filename}`;

    // 更新用户头像
    const user = await db.User.findByPk(req.user.id);
    if (user.user_type === 'counselor') {
      await db.Counselor.update(
        { avatar: avatarPath },
        { where: { user_id: user.id } }
      );
    }

    res.json({
      success: true,
      message: '头像上传成功',
      data: {
        avatar: avatarPath
      }
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({
      success: false,
      message: '上传头像失败',
      error: error.message
    });
  }
}; 