const auditService = require('../services/auditService');

module.exports = function auditLogger(actionType) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        try {
          await auditService.log({
            userId: req.user?.id,
            actionType,
            ipAddress: req.ip,
            browser: req.headers['user-agent'],
            device: req.headers['sec-ch-ua-platform'] || 'unknown',
            details: { path: req.originalUrl }
          });
        } catch (err) {
          console.warn('Audit log failed:', err.message);
        }
      }
    });
    next();
  };
};
