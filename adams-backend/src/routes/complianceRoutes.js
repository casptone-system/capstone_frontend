const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const complianceService = require('../services/complianceService');

router.use(authenticate);
router.get('/daily-check', async (req, res) => {
  const result = await complianceService.runDailyCheck();
  res.json(result);
});

module.exports = router;
