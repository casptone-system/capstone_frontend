module.exports = (sequelize, DataTypes) => {
  const ReviewAction = sequelize.define('ReviewAction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    stage: DataTypes.STRING,
    decision: DataTypes.ENUM('approve', 'reject', 'needs_revision'),
    comments: DataTypes.TEXT
  }, { tableName: 'review_actions', timestamps: true });

  ReviewAction.associate = (models) => {
    ReviewAction.belongsTo(models.Document, { foreignKey: 'documentId' });
    ReviewAction.belongsTo(models.User, { as: 'reviewer', foreignKey: 'reviewerId' });
  };

  return ReviewAction;
};
