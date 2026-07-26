module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT,
    permissions: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }
  }, { tableName: 'roles', timestamps: true });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'roleId' });
    Role.hasMany(models.InvitationCode, { foreignKey: 'roleId' });
  };

  return Role;
};
