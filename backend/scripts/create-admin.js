const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;

async function createAdmin() {
  try {
    // 检查是否已存在管理员账户
    const adminExists = await User.findOne({
      where: {
        username: 'admin',
        userType: 'admin'
      }
    });

    if (adminExists) {
      console.log('管理员账户已存在');
      process.exit(0);
    }

    // 创建管理员账户
    const admin = await User.create({
      username: 'admin',
      password: bcrypt.hashSync('admin123', 8),
      userType: 'admin',
      realName: '系统管理员'
    });

    console.log('管理员账户创建成功:', admin.username);
    process.exit(0);
  } catch (error) {
    console.error('创建管理员账户失败:', error);
    process.exit(1);
  }
}

createAdmin(); 