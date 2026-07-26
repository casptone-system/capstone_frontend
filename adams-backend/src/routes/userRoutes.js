const router = require('express').Router();
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/me', (req, res) => res.json({ user: req.user }));

module.exports = router;
