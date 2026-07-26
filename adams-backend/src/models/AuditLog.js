module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    actionType: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
    browser: DataTypes.STRING,
    device: DataTypes.STRING,
    details: DataTypes.JSONB
  }, { tableName: 'audit_logs', timestamps: true });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return AuditLog;
};
