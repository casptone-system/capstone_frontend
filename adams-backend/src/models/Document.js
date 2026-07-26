module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    area: DataTypes.STRING,
    category: DataTypes.STRING,
    description: DataTypes.TEXT,
    schoolYear: DataTypes.STRING,
    fileType: DataTypes.STRING,
    tags: DataTypes.ARRAY(DataTypes.STRING),
    status: {
      type: DataTypes.ENUM(
        'submitted', 'area_review', 'chair_review',
        'dean_review', 'qa_review', 'vpaa_review',
        'needs_revision', 'accredited'
      ),
      defaultValue: 'submitted'
    }
  }, { tableName: 'documents', timestamps: true });

  Document.associate = (models) => {
    Document.belongsTo(models.User, { as: 'uploader', foreignKey: 'uploaderId' });
    Document.belongsTo(models.Program, { foreignKey: 'programId' });
    Document.hasMany(models.DocumentVersion, { foreignKey: 'documentId' });
    Document.hasMany(models.ReviewAction, { foreignKey: 'documentId' });
  };

  return Document;
};
