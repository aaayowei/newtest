'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 8);
    await queryInterface.bulkInsert('Users', [{
      username: 'admin',
      password: hashedPassword,
      real_name: '系统管理员',
      email: 'admin@example.com',
      phone: '13800000000',
      user_type: 'admin',
      status: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { username: 'admin' }, {});
  }
}; 