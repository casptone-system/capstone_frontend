module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive', 'locked'), defaultValue: 'active' },
    failedLoginAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastLoginAt: DataTypes.DATE,
    lastLogoutAt: DataTypes.DATE
  }, { tableName: 'users', timestamps: true });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'roleId' });
    User.belongsTo(models.College, { foreignKey: 'collegeId' });
    User.belongsTo(models.Department, { foreignKey: 'departmentId' });
    User.belongsTo(models.Program, { foreignKey: 'programId' });
    User.belongsTo(models.Team, { foreignKey: 'teamId' });
    User.hasMany(models.Document, { foreignKey: 'uploaderId' });
    User.hasMany(models.AuditLog, { foreignKey: 'userId' });
  };

  return User;
};
