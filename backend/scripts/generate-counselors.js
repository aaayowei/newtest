const fs = require('fs');
const path = require('path');

// 可用的头像列表（使用已有的头像文件）
const avatars = [
  '/avatars/counselor2.jpg',
  '/avatars/counselor3.jpg',
];

// 专长领域列表
const expertiseList = [
  '抑郁症',
  '焦虑症',
  '人际关系',
  '情感问题',
  '压力管理',
  '职业规划',
  '学业压力',
  '自我认知',
  '生涯规划'
];

// 职称列表
const titles = [
  '心理咨询师',
  '高级心理咨询师',
  '资深心理咨询师',
  '心理治疗师',
  '临床心理学家'
];

// 生成随机数据的辅助函数
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(',');
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成咨询师数据
function generateCounselors(count) {
  const counselors = [];
  const users = [];

  for (let i = 1; i <= count; i++) {
    const userId = 1000 + i;
    
    // 生成用户数据
    users.push({
      id: userId,
      username: `counselor${i}`,
      password: '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', // 默认密码：123456
      email: `counselor${i}@example.com`,
      real_name: `咨询师${i}`,
      user_type: 'counselor',
      phone: `1380000${String(i).padStart(4, '0')}`,
      created_at: new Date(),
      updated_at: new Date()
    });

    // 生成咨询师数据
    counselors.push({
      id: i,
      user_id: userId,
      title: getRandomItem(titles),
      expertise: getRandomItems(expertiseList, getRandomNumber(2, 4)),
      introduction: `我是一名专业的心理咨询师，有着丰富的咨询经验。专注于${getRandomItems(expertiseList, 2)}等领域的心理问题。`,
      avatar: getRandomItem(avatars),
      rating: getRandomNumber(35, 50) / 10,
      consultation_count: getRandomNumber(10, 100),
      satisfaction_rate: getRandomNumber(85, 99),
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // 生成SQL文件
  const sqlContent = `
-- 插入用户数据
INSERT INTO users (id, username, password, email, real_name, user_type, phone, created_at, updated_at) VALUES
${users.map(user => `(${user.id}, '${user.username}', '${user.password}', '${user.email}', '${user.real_name}', '${user.role}', '${user.phone}', '${user.created_at.toISOString()}', '${user.updated_at.toISOString()}')`).join(',\n')};

-- 插入咨询师数据
INSERT INTO counselors (id, user_id, title, expertise, introduction, avatar, rating, consultation_count, satisfaction_rate, created_at, updated_at) VALUES
${counselors.map(counselor => `(${counselor.id}, ${counselor.user_id}, '${counselor.title}', '${counselor.expertise}', '${counselor.introduction}', '${counselor.avatar}', ${counselor.rating}, ${counselor.consultation_count}, ${counselor.satisfaction_rate}, '${counselor.created_at.toISOString()}', '${counselor.updated_at.toISOString()}')`).join(',\n')};
`;

  // 保存SQL文件
  fs.writeFileSync(path.join(__dirname, 'generated-counselors.sql'), sqlContent);
  console.log('生成的SQL文件已保存到 generated-counselors.sql');
}

// 生成20个咨询师数据
generateCounselors(5); 