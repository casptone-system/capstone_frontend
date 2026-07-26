module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT
  }, { tableName: 'teams', timestamps: true });

  Team.associate = (models) => {
    Team.belongsTo(models.Program, { foreignKey: 'programId' });
    Team.hasMany(models.User, { foreignKey: 'teamId' });
    Team.hasMany(models.InvitationCode, { foreignKey: 'teamId' });
  };

  return Team;
};
