const db = require('../models');
const User = db.User;

checkDuplicateUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (user) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    next();
  } catch (error) {
    console.error('验证用户名失败:', error);
    res.status(500).json({ message: '验证用户名失败' });
  }
};

checkDuplicateEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (user) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    next();
  } catch (error) {
    console.error('验证邮箱失败:', error);
    res.status(500).json({ message: '验证邮箱失败' });
  }
};

const verifySignUp = {
  checkDuplicateUsername,
  checkDuplicateEmail
};

module.exports = verifySignUp; 