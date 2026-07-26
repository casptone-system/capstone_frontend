const cron = require('node-cron');
const complianceService = require('../services/complianceService');
const notificationService = require('../services/notificationService');

cron.schedule('0 0 * * *', async () => {
  const results = await complianceService.runDailyCheck();
  await notificationService.sendComplianceAlerts(results);
});
