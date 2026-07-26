const { Document, DocumentVersion, ReviewAction, User } = require('../models');

exports.upload = async ({ uploaderId, file, metadata }) => {
  const document = await Document.create({
    uploaderId,
    area: metadata.area,
    category: metadata.category,
    description: metadata.description,
    schoolYear: metadata.schoolYear,
    fileType: metadata.fileType,
    tags: metadata.tags || [],
    status: 'submitted'
  });

  await DocumentVersion.create({
    documentId: document.id,
    versionNumber: 1,
    fileName: file?.originalname || 'document',
    storagePath: file?.path || '/uploads/default',
    mimeType: file?.mimetype || 'application/octet-stream'
  });

  return document;
};

exports.addVersion = async (documentId, file, reviewerId) => {
  const document = await Document.findByPk(documentId);
  if (!document) throw new Error('Document not found');

  const version = await DocumentVersion.create({
    documentId,
    versionNumber: (await DocumentVersion.count({ where: { documentId } })) + 1,
    fileName: file?.originalname || 'document',
    storagePath: file?.path || '/uploads/default',
    mimeType: file?.mimetype || 'application/octet-stream'
  });

  await document.update({ status: 'needs_revision' });
  await ReviewAction.create({ documentId, reviewerId, stage: 'revision', decision: 'needs_revision' });

  return version;
};

exports.search = async (query, user) => {
  return Document.findAll({
    where: query,
    include: [{ model: User, as: 'uploader' }]
  });
};

exports.delete = async (documentId, user) => {
  const document = await Document.findByPk(documentId);
  if (!document) throw new Error('Document not found');
  await document.destroy();
};

exports.findByStatus = async (status, user) => {
  return Document.findAll({ where: { status } });
};

exports.findById = async (documentId) => {
  return Document.findByPk(documentId);
};

exports.recordReview = async ({ documentId, reviewerId, stage, decision, comments }) => {
  return ReviewAction.create({ documentId, reviewerId, stage, decision, comments });
};

exports.updateStatus = async (documentId, status) => {
  const document = await Document.findByPk(documentId);
  if (!document) throw new Error('Document not found');
  return document.update({ status });
};
