module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT
  }, { tableName: 'departments', timestamps: true });

  Department.associate = (models) => {
    Department.belongsTo(models.College, { foreignKey: 'collegeId' });
    Department.hasMany(models.Program, { foreignKey: 'departmentId' });
    Department.hasMany(models.User, { foreignKey: 'departmentId' });
  };

  return Department;
};
