'use strict';

const router = require('express').Router();
const articleController = require('../controllers/article.controller');
const { authJwt } = require('../middleware');
const multer = require('multer');
const path = require('path');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/articles');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (!extname || !mimetype) {
      cb(new Error('只允许上传 JPG、JPEG、PNG 和 GIF 格式的图片！'));
      return;
    }
    cb(null, true);
  }
}).single('cover');

// 配置图片上传的存储
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/articles');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (!extname || !mimetype) {
      cb(new Error('只允许上传 JPG、JPEG、PNG 和 GIF 格式的图片！'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('image');

// 需要登录的路由
router.get('/', authJwt.verifyToken, articleController.getArticles);
router.get('/:id', articleController.getArticle);

// 收藏相关路由
router.get('/user/favorites', authJwt.verifyToken, articleController.getFavorites);
router.post('/:id/favorite', authJwt.verifyToken, articleController.favoriteArticle);
router.delete('/:id/favorite', authJwt.verifyToken, articleController.unfavoriteArticle);

// 文件上传路由
router.post('/upload/cover', [authJwt.verifyToken, authJwt.isCounselorOrAdmin], function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ 
        message: err.message || '文件上传失败',
        error: err
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    const filePath = `/articles/${req.file.filename}`;
    res.json({
      message: '上传成功',
      url: filePath
    });
  });
});

// 上传文章内容图片
router.post('/upload/image', [authJwt.verifyToken, authJwt.isCounselorOrAdmin], function(req, res) {
  imageUpload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ 
        message: err.message || '图片上传失败',
        error: err
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    const filePath = `/articles/${req.file.filename}`;
    res.json({
      url: filePath
    });
  });
});

// 咨询师和管理员路由
router.post('/', [authJwt.verifyToken, authJwt.isCounselorOrAdmin], articleController.createArticle);

// 文章作者和管理员路由
router.put('/:id', [authJwt.verifyToken, authJwt.isArticleOwnerOrAdmin], articleController.updateArticle);
router.delete('/:id', [authJwt.verifyToken, authJwt.isArticleOwnerOrAdmin], articleController.deleteArticle);

module.exports = router; 