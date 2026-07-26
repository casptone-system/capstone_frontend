module.exports = (sequelize, DataTypes) => {
  const DocumentVersion = sequelize.define('DocumentVersion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    versionNumber: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    storagePath: DataTypes.STRING,
    fileName: DataTypes.STRING,
    mimeType: DataTypes.STRING
  }, { tableName: 'document_versions', timestamps: true });

  DocumentVersion.associate = (models) => {
    DocumentVersion.belongsTo(models.Document, { foreignKey: 'documentId' });
  };

  return DocumentVersion;
};
