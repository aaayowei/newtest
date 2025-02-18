const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const controller = require("../controllers/appointment.controller");

// 创建预约
router.post(
  "/",
  [authJwt.verifyToken, authJwt.isStudent],
  controller.createAppointment
);

// 获取预约列表
router.get(
  "/",
  [authJwt.verifyToken],
  controller.getAppointments
);

// 获取预约详情
router.get(
  "/:id",
  [authJwt.verifyToken],
  controller.getAppointmentDetail
);

// 检查预约是否可以取消
router.get(
  "/:id/can-cancel",
  [authJwt.verifyToken, authJwt.isStudent],
  controller.checkCancellable
);

// 取消预约
router.post(
  "/:id/cancel",
  [authJwt.verifyToken, authJwt.isStudent],
  controller.cancelAppointment
);

// 更新预约状态
router.patch(
  "/:id/status",
  [authJwt.verifyToken],
  controller.updateAppointmentStatus
);

// 提交评价
router.post(
  "/:id/review",
  [authJwt.verifyToken, authJwt.isStudent],
  controller.submitReview
);

// 提交咨询记录
router.post(
  "/:id/notes",
  [authJwt.verifyToken, authJwt.isCounselor],
  controller.submitNotes
);

// 分配咨询地点/链接
router.patch(
  "/:id/location",
  [authJwt.verifyToken, authJwt.isCounselor],
  controller.assignAppointmentLocation
);

// 获取预约相关用户信息
router.get(
  '/:appointmentId/users',
  [authJwt.verifyToken],
  controller.getAppointmentUsers
);

module.exports = router; 