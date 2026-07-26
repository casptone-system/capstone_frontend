const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/health', authorize('admin', 'super_admin'), (req, res) => res.json({ status: 'ok' }));

module.exports = router;
