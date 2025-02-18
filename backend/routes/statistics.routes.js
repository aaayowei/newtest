const router = require('express').Router();
const statisticsController = require('../controllers/statistics.controller');
const { authJwt } = require('../middleware');

router.get('/overview', [authJwt.verifyToken, authJwt.isCounselorOrAdmin], statisticsController.getOverviewStats);
router.get('/assessments', [authJwt.verifyToken, authJwt.isCounselorOrAdmin], statisticsController.getAssessmentStats);
router.get('/appointments', [authJwt.verifyToken, authJwt.isCounselorOrAdmin], statisticsController.getAppointmentTrends);

module.exports = router; 