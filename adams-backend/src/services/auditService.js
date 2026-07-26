const { AuditLog } = require('../models');

exports.log = async ({ userId, actionType, ipAddress, browser, device, details }) => {
  return AuditLog.create({
    userId,
    actionType,
    ipAddress,
    browser,
    device,
    details
  });
};
