const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const controller = require("../controllers/notification.controller");

// 获取未读通知
router.get(
  "/unread",
  [authJwt.verifyToken],
  controller.getUnreadNotifications
);

// 标记通知为已读
router.patch(
  "/:id/read",
  [authJwt.verifyToken],
  controller.markAsRead
);

module.exports = router; 