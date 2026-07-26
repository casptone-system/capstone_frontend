module.exports = (sequelize, DataTypes) => {
  const InvitationCode = sequelize.define('InvitationCode', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(6), unique: true, allowNull: false },
    expiresAt: DataTypes.DATE,
    maxUses: { type: DataTypes.INTEGER, defaultValue: 1 },
    usedCount: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { tableName: 'invitation_codes', timestamps: true });

  InvitationCode.associate = (models) => {
    InvitationCode.belongsTo(models.Team, { foreignKey: 'teamId' });
    InvitationCode.belongsTo(models.Role, { foreignKey: 'roleId' });
  };

  return InvitationCode;
};
