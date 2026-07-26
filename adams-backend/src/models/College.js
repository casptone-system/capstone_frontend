module.exports = (sequelize, DataTypes) => {
  const College = sequelize.define('College', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT
  }, { tableName: 'colleges', timestamps: true });

  College.associate = (models) => {
    College.hasMany(models.Department, { foreignKey: 'collegeId' });
    College.hasMany(models.User, { foreignKey: 'collegeId' });
  };

  return College;
};
