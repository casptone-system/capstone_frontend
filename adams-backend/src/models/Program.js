module.exports = (sequelize, DataTypes) => {
  const Program = sequelize.define('Program', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    accreditationStatus: { type: DataTypes.ENUM('compliant', 'at-risk', 'non-compliant'), defaultValue: 'at-risk' },
    complianceScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    description: DataTypes.TEXT
  }, { tableName: 'programs', timestamps: true });

  Program.associate = (models) => {
    Program.belongsTo(models.Department, { foreignKey: 'departmentId' });
    Program.belongsTo(models.College, { foreignKey: 'collegeId' });
    Program.hasMany(models.User, { foreignKey: 'programId' });
    Program.hasMany(models.Team, { foreignKey: 'programId' });
    Program.hasMany(models.Document, { foreignKey: 'programId' });
  };

  return Program;
};
