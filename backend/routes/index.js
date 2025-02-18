const express = require('express');
const router = express.Router();

// 导入路由模块
const userRoutes = require('./user.routes');
const appointmentRoutes = require('./appointment.routes');
const counselorRoutes = require('./counselor.routes');
const adminRoutes = require('./admin.routes');
const messageRoutes = require('./message.routes');
const notificationRoutes = require('./notification.routes');
const articleRoutes = require('./article.routes');
const assessmentRoutes = require('./assessment.routes');
const statisticsRoutes = require('./statistics.routes');

// 注册路由
router.use('/users', userRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/counselors', counselorRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/articles', articleRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/statistics', statisticsRoutes);

module.exports = router; 