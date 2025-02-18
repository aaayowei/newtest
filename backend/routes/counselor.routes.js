const express = require('express');
const router = express.Router();
const counselorController = require('../controllers/counselor.controller');
const scheduleController = require('../controllers/schedule.controller');
const { authJwt } = require('../middleware');

// 验证是否是咨询师的中间件
const isCounselor = [
  authJwt.verifyToken,
  authJwt.isCounselor
];

// 获取咨询师列表
router.get('/', counselorController.getCounselors);

// 获取咨询师自己的排班
router.get('/my/schedules', isCounselor, scheduleController.getMyCounselorSchedules);

// 获取咨询师详情
router.get('/:id', counselorController.getCounselorDetail);

// 获取咨询师可用时间段
router.get('/:id/schedules', counselorController.getAvailableTimeSlots);

// 获取咨询师评价列表
router.get('/:id/reviews', counselorController.getCounselorReviews);

module.exports = router; 