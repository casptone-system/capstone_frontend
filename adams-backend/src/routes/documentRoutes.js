const router = require('express').Router();
const documentController = require('../controllers/documentController');
const authenticate = require('../middleware/authenticate');
const auditLogger = require('../middleware/auditLogger');
const upload = require('../middleware/upload');

router.use(authenticate);
router.get('/', documentController.list);
router.post('/', upload.single('file'), auditLogger('upload_file'), documentController.upload);
router.post('/:documentId/versions', upload.single('file'), auditLogger('edit_file'), documentController.replaceVersion);
router.delete('/:documentId', auditLogger('delete_file'), documentController.remove);

module.exports = router;
