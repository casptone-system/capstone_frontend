module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    content: DataTypes.JSONB,
    generatedBy: DataTypes.UUID
  }, { tableName: 'reports', timestamps: true });

  Report.associate = (models) => {
    Report.belongsTo(models.User, { foreignKey: 'generatedBy' });
  };

  return Report;
};
