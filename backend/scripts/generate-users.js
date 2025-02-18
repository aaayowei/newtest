const fs = require('fs');
const path = require('path');

// 格式化日期为MySQL格式
function formatDate(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// 生成随机手机号
function generatePhone(index) {
  return `1380000${String(index).padStart(4, '0')}`;
}

// 生成随机数字
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机姓名
function generateName(prefix, index) {
  return `${prefix}${index}`;
}

// 生成用户数据
function generateUsers() {
  const users = [];
  const counselors = [];
  const students = [];
  const admins = [];
  const currentDate = new Date();

//   // 生成管理员数据
//   for (let i = 1; i <= 3; i++) {
//     const adminId = i;
//     users.push({
//       id: adminId,
//       username: `admin${i}`,
//       password: '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', // 默认密码：123456
//       email: `admin${i}@example.com`,
//       real_name: generateName('管理员', i),
//       user_type: 'admin',
//       phone: generatePhone(i),
//       status: 1,
//       created_at: formatDate(currentDate),
//       updated_at: formatDate(currentDate)
//     });
//   }

  // 生成咨询师数据
  for (let i = 1; i <= 10; i++) {
    const userId = 100 + i;
    users.push({
      id: userId,
      username: `counselor${i}`,
      password: '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO',
      email: `counselor${i}@example.com`,
      real_name: generateName('咨询师', i),
      user_type: 'counselor',
      phone: generatePhone(userId),
      status: 1,
      created_at: formatDate(currentDate),
      updated_at: formatDate(currentDate)
    });

    counselors.push({
      id: i,
      user_id: userId,
      title: ['心理咨询师', '高级心理咨询师', '资深心理咨询师', '心理治疗师', '临床心理学家'][getRandomNumber(0, 4)],
      expertise: ['抑郁症,焦虑症', '人际关系,情感问题', '压力管理,职业规划', '学业压力,自我认知', '生涯规划,心理健康'][getRandomNumber(0, 4)],
      introduction: `我是一名专业的心理咨询师，有着丰富的咨询经验。`,
      avatar: `/avatars/counselor${(i % 5) + 1}.jpg`,
      rating: (getRandomNumber(25, 50) / 10).toFixed(1),
      consultation_count: getRandomNumber(10, 100),
      satisfaction_rate: getRandomNumber(85, 99),
      status: 'available',
      created_at: formatDate(currentDate),
      updated_at: formatDate(currentDate)
    });
  }

  // 生成学生数据
  // for (let i = 1; i <= 20; i++) {
  //   const userId = 200 + i;
  //   users.push({
  //     id: userId,
  //     username: `student${i}`,
  //     password: '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO',
  //     email: `student${i}@example.com`,
  //     real_name: generateName('学生', i),
  //     user_type: 'student',
  //     phone: generatePhone(userId),
  //     status: 1,
  //     created_at: formatDate(currentDate),
  //     updated_at: formatDate(currentDate)
  //   });
  // }

  // 生成SQL文件
  const sqlContent = `
-- 插入用户数据
INSERT INTO users (id, username, password, email, real_name, user_type, phone, status, created_at, updated_at) VALUES
${users.map(user => `(${user.id}, '${user.username}', '${user.password}', '${user.email}', '${user.real_name}', '${user.user_type}', '${user.phone}', ${user.status}, '${user.created_at}', '${user.updated_at}')`).join(',\n')};

-- 插入咨询师数据
INSERT INTO counselors (id, user_id, title, expertise, introduction, avatar, rating, consultation_count, satisfaction_rate, status, created_at, updated_at) VALUES
${counselors.map(counselor => `(${counselor.id}, ${counselor.user_id}, '${counselor.title}', '${counselor.expertise}', '${counselor.introduction}', '${counselor.avatar}', ${counselor.rating}, ${counselor.consultation_count}, ${counselor.satisfaction_rate}, '${counselor.status}', '${counselor.created_at}', '${counselor.updated_at}')`).join(',\n')};
`;

  // 保存SQL文件
  fs.writeFileSync(path.join(__dirname, 'generated-users.sql'), sqlContent);
  console.log('生成的SQL文件已保存到 generated-users.sql');
}

// 生成用户数据
generateUsers(); 