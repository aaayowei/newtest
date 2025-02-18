const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getAllUsers,
  updateUser,
  updateUserStatus,
  resetUserPassword
} = require('../controllers/admin.controller');
const scheduleController = require('../controllers/schedule.controller');
const { authJwt } = require('../middleware');

// 验证是否是管理员的中间件
const isAdmin = [
  authJwt.verifyToken,
  authJwt.isAdmin
];

// 仪表盘数据
router.get('/dashboard', isAdmin, getDashboardStats);

// 用户管理路由
router.get('/users', isAdmin, getAllUsers);
router.put('/users/:id', isAdmin, updateUser);
router.patch('/users/:id/status', isAdmin, updateUserStatus);
router.post('/users/:id/reset-password', isAdmin, resetUserPassword);

// 排班管理路由
router.get('/schedules', isAdmin, scheduleController.getSchedules);
router.post('/schedules', isAdmin, scheduleController.addSchedules);
router.post('/schedules/batch', isAdmin, scheduleController.batchAddSchedules);
router.delete('/schedules/:id', isAdmin, scheduleController.cancelSchedule);

module.exports = router; 