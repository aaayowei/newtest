'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('counselor123', 8);
    
    // 创建咨询师用户
    await queryInterface.bulkInsert('Users', [
      {
        username: 'counselor1',
        password: hashedPassword,
        user_type: 'counselor',
        real_name: '张医生',
        email: 'counselor1@example.com',
        phone: '13811111111',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'counselor2',
        password: hashedPassword,
        user_type: 'counselor',
        real_name: '李医生',
        email: 'counselor2@example.com',
        phone: '13822222222',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'counselor3',
        password: hashedPassword,
        user_type: 'counselor',
        real_name: '王医生',
        email: 'counselor3@example.com',
        phone: '13833333333',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 获取插入的用户ID
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE username IN ('counselor1', 'counselor2', 'counselor3')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 创建咨询师详细信息
    await queryInterface.bulkInsert('Counselors', [
      {
        user_id: users[0].id,
        title: '心理咨询师',
        avatar: '/avatars/counselor1.jpg',
        expertise: '抑郁症,焦虑症,人际关系',
        introduction: '张医生拥有10年心理咨询经验，擅长处理抑郁、焦虑等心理问题。毕业于北京大学心理学专业，持有国家二级心理咨询师证书。',
        education: '北京大学心理学博士\n中国心理学会注册心理师',
        rating: 4.8,
        consultation_count: 100,
        satisfaction_rate: 98.5,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: users[1].id,
        title: '心理治疗师',
        avatar: '/avatars/counselor2.jpg',
        expertise: '情感问题,压力管理,职业规划',
        introduction: '李医生专注于情感咨询和压力管理，帮助学生解决学习和生活中的困扰。擅长沟通，善于倾听。',
        education: '清华大学心理学硕士\n美国心理协会会员',
        rating: 4.6,
        consultation_count: 80,
        satisfaction_rate: 97.0,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: users[2].id,
        title: '专业咨询师',
        avatar: '/avatars/counselor3.jpg',
        expertise: '学业压力,自我认知,生涯规划',
        introduction: '王医生具有丰富的校园心理咨询经验，专注于帮助学生处理学业压力和生涯规划问题。温和亲切，深受学生信赖。',
        education: '武汉大学心理学硕士\n国家二级心理咨询师',
        rating: 4.7,
        consultation_count: 90,
        satisfaction_rate: 98.0,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 创建咨询师排班
    const counselors = await queryInterface.sequelize.query(
      `SELECT id FROM Counselors`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const schedules = [];
    const today = new Date();
    const timeSlots = ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

    // 为每个咨询师创建未来14天的排班
    for (let counselor of counselors) {
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // 跳过周末
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        for (let timeSlot of timeSlots) {
          schedules.push({
            counselor_id: counselor.id,
            date: date,
            time_slot: timeSlot,
            status: 'available',
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    }

    await queryInterface.bulkInsert('CounselorSchedules', schedules);
  },

  down: async (queryInterface, Sequelize) => {
    // 按照依赖关系的反序删除数据
    await queryInterface.bulkDelete('CounselorSchedules', null, {});
    await queryInterface.bulkDelete('Counselors', null, {});
    await queryInterface.bulkDelete('Users', { user_type: 'counselor' }, {});
  }
}; 