const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/join-team', authenticate, authController.joinTeam);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
