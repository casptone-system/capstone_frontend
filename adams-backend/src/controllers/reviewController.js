const documentService = require('../services/documentService');

const STAGE_BY_ROLE = {
  area_in_charge: 'area_review',
  program_chair: 'chair_review',
  dean: 'dean_review',
  qa: 'qa_review',
  vpaa: 'vpaa_review'
};

const NEXT_STAGE = {
  area_review: 'chair_review',
  chair_review: 'dean_review',
  dean_review: 'qa_review',
  qa_review: 'vpaa_review',
  vpaa_review: 'accredited'
};

exports.queue = async (req, res) => {
  const stage = STAGE_BY_ROLE[req.user.role];
  const docs = await documentService.findByStatus(stage, req.user);
  res.json(docs);
};

exports.decide = async (req, res) => {
  const { documentId } = req.params;
  const { decision, comments } = req.body;

  const doc = await documentService.findById(documentId);
  const currentStage = doc.status;
  const newStatus = decision === 'approve' ? NEXT_STAGE[currentStage] : 'needs_revision';

  await documentService.recordReview({ documentId, reviewerId: req.user.id, stage: currentStage, decision, comments });
  await documentService.updateStatus(documentId, newStatus);

  res.json({ documentId, newStatus });
};
