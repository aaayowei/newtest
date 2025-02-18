const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { verifyToken, isStudentOrCounselor } = require('../middleware/authJwt');

// 获取预约的聊天记录
router.get('/:appointmentId', [verifyToken, isStudentOrCounselor], messageController.getChatHistory);

module.exports = router; 