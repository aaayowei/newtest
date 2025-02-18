'use strict';

const router = require('express').Router();
const { authJwt } = require('../middleware');
const assessmentController = require('../controllers/assessment.controller');

// 管理员路由 - 放在最前面以避免路径冲突
router.get('/questions', [authJwt.verifyToken, authJwt.isAdmin], assessmentController.getQuestionsList);
router.post('/questions', [authJwt.verifyToken, authJwt.isAdmin], assessmentController.createQuestion);
router.put('/questions/:id', [authJwt.verifyToken, authJwt.isAdmin], assessmentController.updateQuestion);
router.delete('/questions/:id', [authJwt.verifyToken, authJwt.isAdmin], assessmentController.deleteQuestion);

// 咨询师路由
router.get('/statistics', [authJwt.verifyToken, authJwt.isCounselorOrAdmin], assessmentController.getStatistics);

// 学生路由
router.post('/type/:type/submit', [authJwt.verifyToken, authJwt.isStudent], assessmentController.submitAssessment);
router.get('/user/:userId/history', authJwt.verifyToken, assessmentController.getUserAssessments);

// 公共路由 - 放在最后
router.get('/type/:type/questions', authJwt.verifyToken, assessmentController.getAssessmentQuestions);
router.get('/:id', authJwt.verifyToken, assessmentController.getAssessmentDetail);
router.get('/', authJwt.verifyToken, assessmentController.getAssessments);

module.exports = router; 