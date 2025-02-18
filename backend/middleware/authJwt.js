'use strict';

const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.User;
const Article = db.Article;

let verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({
      message: "未提供token"
    });
  }

  try {
    const decoded = jwt.verify(token, config.secret);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        message: "用户不存在"
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({
      message: "未授权"
    });
  }
};

let isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.user_type === "admin") {
      next();
      return;
    }

    res.status(403).json({
      message: "需要管理员权限"
    });
  } catch (error) {
    res.status(500).json({
      message: "验证管理员权限失败"
    });
  }
};

let isCounselor = async (req, res, next) => {
  try {
    if (req.user && req.user.user_type === "counselor") {
      next();
      return;
    }

    res.status(403).json({
      message: "需要咨询师权限"
    });
  } catch (error) {
    res.status(500).json({
      message: "验证咨询师权限失败"
    });
  }
};

let isStudent = async (req, res, next) => {
  try {
    if (req.user && req.user.user_type === "student") {
      next();
      return;
    }

    res.status(403).json({
      message: "需要学生权限"
    });
  } catch (error) {
    res.status(500).json({
      message: "验证学生权限失败"
    });
  }
};

let isStudentOrCounselor = async (req, res, next) => {
  try {
    if (req.user && (req.user.user_type === "student" || req.user.user_type === "counselor")) {
      next();
      return;
    }

    res.status(403).json({
      message: "需要学生或咨询师权限"
    });
  } catch (error) {
    res.status(500).json({
      message: "验证权限失败"
    });
  }
};

let isCounselorOrAdmin = async (req, res, next) => {
  try {
    if (req.user && (req.user.user_type === "counselor" || req.user.user_type === "admin")) {
      next();
      return;
    }

    res.status(403).json({
      message: "需要咨询师或管理员权限"
    });
  } catch (error) {
    res.status(500).json({
      message: "验证权限失败"
    });
  }
};

let isArticleOwnerOrAdmin = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findByPk(articleId);
    
    if (!article) {
      return res.status(404).json({
        message: "文章不存在"
      });
    }

    // 管理员可以编辑所有文章
    if (req.user.user_type === "admin") {
      next();
      return;
    }

    // 作者可以编辑自己的文章
    if (article.author_id === req.user.id) {
      next();
      return;
    }

    res.status(403).json({
      message: "只有文章作者或管理员可以执行此操作"
    });
  } catch (error) {
    res.status(500).json({
      message: "验证文章权限失败"
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isCounselor,
  isStudent,
  isStudentOrCounselor,
  isCounselorOrAdmin,
  isArticleOwnerOrAdmin
};

module.exports = authJwt; 