const router = require('express').Router();
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/', (req, res) => res.json({ message: 'Reports endpoint placeholder' }));

module.exports = router;
