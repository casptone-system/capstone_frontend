const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/teams', require('./teamRoutes'));
router.use('/documents', require('./documentRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/compliance', require('./complianceRoutes'));
router.use('/audit', require('./auditRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
