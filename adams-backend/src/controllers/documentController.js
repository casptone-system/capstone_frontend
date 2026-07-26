const documentService = require('../services/documentService');

exports.upload = async (req, res) => {
  const { area, category, description, schoolYear, fileType, tags } = req.body;
  const doc = await documentService.upload({
    uploaderId: req.user.id,
    file: req.file,
    metadata: { area, category, description, schoolYear, fileType, tags }
  });
  res.status(201).json(doc);
};

exports.replaceVersion = async (req, res) => {
  const version = await documentService.addVersion(req.params.documentId, req.file, req.user.id);
  res.status(201).json(version);
};

exports.list = async (req, res) => {
  const docs = await documentService.search(req.query, req.user);
  res.json(docs);
};

exports.remove = async (req, res) => {
  await documentService.delete(req.params.documentId, req.user);
  res.status(204).send();
};
