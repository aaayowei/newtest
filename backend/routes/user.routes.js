const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(new Error('只允许上传 PNG、JPEG 或 JPG 格式的图片！'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

// CORS 中间件
router.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// 公开路由
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/check-username", controller.checkUsername);

// 需要验证token的路由
router.get(
  "/profile",
  [authJwt.verifyToken],
  controller.getUserProfile
);

router.put(
  "/profile",
  [authJwt.verifyToken],
  controller.updateProfile
);

router.post(
  "/change-password",
  [authJwt.verifyToken],
  controller.changePassword
);

// 头像上传路由
router.post(
  "/avatar",
  [authJwt.verifyToken],
  upload.single('avatar'),
  controller.uploadAvatar
);

module.exports = router; 